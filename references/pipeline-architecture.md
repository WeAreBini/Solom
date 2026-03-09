# Backend Core Pipeline Architecture

**Version:** 1.0
**Status:** Draft
**Owner:** CTO
**Parent Issue:** SOL-34

---

## Overview

The Backend Core Pipeline is a deterministic, auditable pipeline of specialized sub-agents and Python scripts. **No LLM guessing at execution time** - all components are Python scripts with defined inputs/outputs.

```
┌─────────────────────────────────────────────────────────────────┐
│                    PIPELINE ORCHESTRATOR                         │
│                     (Python asyncio)                              │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  SCAN STAGE   │───▶│ RESEARCH      │───▶│ PREDICT       │
│               │    │    STAGE      │    │    STAGE      │
│ 300+ markets  │    │ Parallel      │    │ XGBoost +     │
│ filtered      │    │ sentiment     │    │ consensus     │
└───────────────┘    └───────────────┘    └───────────────┘
                                                  │
                                                  ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  COMPOUND     │◀───│ EXECUTE       │◀───│ RISK & SIZING │
│    STAGE      │    │    STAGE      │    │    STAGE      │
│ Knowledge     │    │ On-chain      │    │ Deterministic │
│ extraction    │    │ CLOB API      │    │ checks        │
└───────────────┘    └───────────────┘    └───────────────┘
```

---

## Stage Specifications

### 1. Scan Stage

**Purpose:** Filter 300+ markets by liquidity/volume criteria

**Input:**
```python
@dataclass
class ScanInput:
    market_universe: list[str]  # All available markets
    min_liquidity: float        # Minimum 24h volume (USD)
    min_open_interest: float    # Minimum OI (USD)
    exclude_markets: list[str]  # Blacklisted markets
```

**Output:**
```python
@dataclass
class ScanOutput:
    candidate_markets: list[MarketCandidate]
    scan_timestamp: datetime
    filter_stats: FilterStats
    
@dataclass
class MarketCandidate:
    market_id: str
    ticker: str
    liquidity_usd: float
    open_interest_usd: float
    volume_24h: float
    sentiment_score: float | None
    
@dataclass
class FilterStats:
    total_markets: int
    passed_liquidity: int
    passed_oi: int
    final_candidates: int
```

**Timing Budget:** 2 seconds

**Implementation:** `pipeline/stages/scan.py`

```python
async def scan_stage(input: ScanInput) -> ScanOutput:
    """
    Filter markets by liquidity and volume criteria.
    
    Steps:
    1. Fetch market data from CLOB API
    2. Apply liquidity filter (min_liquidity)
    3. Apply open interest filter (min_open_interest)
    4. Sort by volume_24h descending
    5. Return top candidates
    """
    pass
```

**Error Handling:**
- API timeout → retry with exponential backoff (3 retries)
- Rate limit → wait and retry
- Invalid data → log and skip market

---

### 2. Research Stage

**Purpose:** Parallel sentiment collection from multiple sources

**Input:**
```python
@dataclass
class ResearchInput:
    candidates: list[MarketCandidate]
    sources: list[DataSource]
    max_parallel_requests: int
    
@dataclass
class DataSource:
    name: str  # "twitter", "reddit", "rss"
    weight: float
    api_key: str | None
```

**Output:**
```python
@dataclass
class ResearchOutput:
    market_research: dict[str, MarketResearch]
    research_timestamp: datetime
    source_health: dict[str, SourceHealth]
    
@dataclass
class MarketResearch:
    market_id: str
    sentiment_scores: dict[str, float]  # source -> score
    weighted_sentiment: float
    mention_count: int
    key_topics: list[str]
    confidence: float
```

**Timing Budget:** 10 seconds (parallel execution)

**Implementation:** `pipeline/stages/research.py`

```python
async def research_stage(input: ResearchInput) -> ResearchOutput:
    """
    Collect sentiment from multiple sources in parallel.
    
    Steps:
    1. Create async tasks for each source + market combo
    2. Rate limit to max_parallel_requests
    3. Aggregate and weight scores
    4. Calculate confidence based on source agreement
    """
    pass
```

**Error Handling:**
- Source timeout → use available data, reduce confidence
- Invalid response → skip source, log error
- All sources fail → return with confidence=0

---

### 3. Predict Stage

**Purpose:** XGBoost model + agent consensus for probability estimation

**Input:**
```python
@dataclass
class PredictInput:
    candidates: list[MarketCandidate]
    research: dict[str, MarketResearch]
    model_path: str
    agent_consensus_threshold: float
```

**Output:**
```python
@dataclass
class PredictOutput:
    predictions: list[Prediction]
    model_confidence: float
    consensus_score: float

@dataclass  
class Prediction:
    market_id: str
    p_yes: float
    p_no: float
    edge: float  # |p - 0.5| or calibrated edge
    kelly_fraction: float
    model_contributions: dict[str, float]
```

**Timing Budget:** 5 seconds

**Implementation:** `pipeline/stages/predict.py`

```python
async def predict_stage(input: PredictInput) -> PredictOutput:
    """
    Generate probability predictions using XGBoost + agent consensus.
    
    Steps:
    1. Load XGBoost model from model_path
    2. Prepare feature vector from research
    3. Get model probability prediction
    4. Query agent ensemble for consensus
    5. Calibrate using Brier Score history
    6. Calculate Kelly fraction for sizing
    """
    pass
```

**Error Handling:**
- Model not found → fallback to agent-only prediction
- Agent timeout → use model only, reduce confidence
- Invalid features → log and skip market

---

### 4. Risk & Sizing Stage

**Purpose:** Apply all deterministic checks before execution

**Input:**
```python
@dataclass
class RiskInput:
    predictions: list[Prediction]
    current_positions: list[Position]
    account_balance: float
    risk_limits: RiskLimits
    
@dataclass
class RiskLimits:
    max_position_size_pct: float  # % of bankroll
    max_total_risk_pct: float
    min_edge_threshold: float
    max_correlated_positions: int
    cooldown_hours: int
```

**Output:**
```python
@dataclass
class RiskOutput:
    approved_trades: list[ApprovedTrade]
    rejected_trades: list[RejectedTrade]
    risk_metrics: RiskMetrics

@dataclass
class ApprovedTrade:
    market_id: str
    direction: str  # "YES" or "NO"
    size_usd: float
    predicted_edge: float
    kelly_fraction: float
    stop_loss_pct: float
    
@dataclass
class RejectedTrade:
    market_id: str
    rejection_reason: str
    prediction: Prediction
```

**Timing Budget:** 1 second

**Implementation:** `pipeline/stages/risk.py`

```python
async def risk_stage(input: RiskInput) -> RiskOutput:
    """
    Apply deterministic risk checks.
    
    Checks:
    1. Edge above min_threshold
    2. Position size within max_position_size_pct
    3. Total risk within max_total_risk_pct
    4. No cooldown violation
    5. Not too many correlated positions
    6. Bankroll can cover loss
    """
    pass
```

**Error Handling:**
- All deterministic checks → no retries, clear rejection reasons
- Position fetch failure → reject all trades (conservative)

---

### 5. Execute Stage

**Purpose:** Execute approved trades via on-chain CLOB API

**Input:**
```python
@dataclass
class ExecuteInput:
    approved_trades: list[ApprovedTrade]
    clob_api_url: str
    wallet_private_key: str
    slippage_tolerance_pct: float
```

**Output:**
```python
@dataclass
class ExecuteOutput:
    executed_trades: list[ExecutedTrade]
    failed_trades: list[FailedTrade]
    total_value_usd: float
    
@dataclass
class ExecutedTrade:
    market_id: str
    direction: str
    size_usd: float
    fill_price: float
    slippage_pct: float
    tx_hash: str
    timestamp: datetime

@dataclass
class FailedTrade:
    market_id: str
    error: str
    retry_count: int
```

**Timing Budget:** 10 seconds (includes network latency)

**Implementation:** `pipeline/stages/execute.py`

```python
async def execute_stage(input: ExecuteInput) -> ExecuteOutput:
    """
    Execute trades on CLOB with slippage monitoring.
    
    Steps:
    1. Connect to CLOB API
    2. For each approved trade:
       a. Get current order book
       b. Calculate expected fill price
       c. Submit limit order with slippage buffer
       d. Monitor for fill
       e. Record execution details
    3. Return executed/failed lists
    """
    pass
```

**Error Handling:**
- Order timeout → cancel and retry once
- Slippage exceeded → reject trade
- API failure → queue for retry in next cycle

---

### 6. Compound Stage

**Purpose:** Extract knowledge and update calibration

**Input:**
```python
@dataclass
class CompoundInput:
    executed_trades: list[ExecutedTrade]
    predictions: list[Prediction]
    market_outcomes: dict[str, str]  # market_id -> "YES"/"NO"
```

**Output:**
```python
@dataclass
class CompoundOutput:
    resolved_trades: list[ResolvedTrade]
    knowledge_updates: list[KnowledgeUpdate]
    brier_score: float
    calibration_adjustment: float

@dataclass
class ResolvedTrade:
    market_id: str
    predicted_p: float
    outcome: str
    correct: bool
    profit_loss: float
    
@dataclass
class KnowledgeUpdate:
    category: str
    insight: str
    confidence: float
    source: str
```

**Timing Budget:** 2 seconds

**Implementation:** `pipeline/stages/compound.py`

```python
async def compound_stage(input: CompoundInput) -> CompoundOutput:
    """
    Learn from resolved trades.
    
    Steps:
    1. Match trades to outcomes
    2. Calculate profit/loss
    3. Compute Brier Score for predictions
    4. Extract insights for knowledge base
    5. Adjust model calibration if needed
    """
    pass
```

---

## Module Structure

```
pipeline/
├── __init__.py
├── orchestrator.py          # Main pipeline runner
├── config.py                # Configuration management
├── state.py                 # Pipeline state persistence
├── types.py                 # All dataclasses
│
├── stages/
│   ├── __init__.py
│   ├── scan.py              # Stage 1: Market filtering
│   ├── research.py          # Stage 2: Sentiment collection
│   ├── predict.py           # Stage 3: Probability prediction
│   ├── risk.py              # Stage 4: Risk checks
│   ├── execute.py           # Stage 5: Trade execution
│   └── compound.py          # Stage 6: Learning
│
├── models/
│   ├── __init__.py
│   ├── xgboost_predictor.py
│   └── calibration.py
│
├── sources/
│   ├── __init__.py
│   ├── twitter.py
│   ├── reddit.py
│   └── rss.py
│
└── utils/
    ├── __init__.py
    ├── logging.py
    └── retry.py
```

---

## Configuration Management

```python
# pipeline/config.py

from dataclasses import dataclass
from pathlib import Path

@dataclass
class PipelineConfig:
    # Scan stage
    min_liquidity_usd: float = 10000.0
    min_open_interest_usd: float = 5000.0
    
    # Research stage
    max_parallel_sources: int = 5
    source_weights: dict[str, float] = None
    
    # Predict stage
    model_path: Path = Path("models/xgboost_latest.pkl")
    min_edge_threshold: float = 0.05
    agent_consensus_threshold: float = 0.7
    
    # Risk stage
    max_position_size_pct: float = 0.02
    max_total_risk_pct: float = 0.10
    cooldown_hours: int = 24
    
    # Execute stage
    slippage_tolerance_pct: float = 0.01
    
    # Compound stage
    brier_lookback_days: int = 30
    
    # Global
    end_to_end_timeout_seconds: float = 30.0
```

Configuration loaded from:
1. `config/pipeline.yaml` (base config)
2. `config/pipeline.{env}.yaml` (environment overrides)
3. Environment variables (highest priority)

---

## State Management

```python
# pipeline/state.py

from dataclasses import dataclass
from datetime import datetime
import json
from pathlib import Path

@dataclass
class PipelineState:
    run_id: str
    started_at: datetime
    current_stage: str
    completed_stages: list[str]
    failed: bool
    error_message: str | None
    
    def save(self, path: Path):
        """Persist state to disk for recovery."""
        pass
    
    @classmethod
    def load(cls, path: Path) -> 'PipelineState':
        """Load previous state for recovery."""
        pass
```

State file format:
```json
{
  "run_id": "run_2026_03_09_21_30_00",
  "started_at": "2026-03-09T21:30:00Z",
  "current_stage": "execute",
  "completed_stages": ["scan", "research", "predict", "risk"],
  "failed": false,
  "error_message": null
}
```

---

## Interface Specifications

### Stage Interface

All stages implement this common interface:

```python
from abc import ABC, abstractmethod
from typing import Generic, TypeVar

InputType = TypeVar('InputType')
OutputType = TypeVar('OutputType')

class Stage(ABC, Generic[InputType, OutputType]):
    """Base class for all pipeline stages."""
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Stage name for logging."""
        pass
    
    @property
    @abstractmethod
    def timing_budget_seconds(self) -> float:
        """Maximum allowed execution time."""
        pass
    
    @abstractmethod
    async def execute(self, input: InputType) -> OutputType:
        """Execute the stage logic."""
        pass
    
    @abstractmethod
    def validate_input(self, input: InputType) -> bool:
        """Validate input before execution."""
        pass
    
    @abstractmethod
    def validate_output(self, output: OutputType) -> bool:
        """Validate output after execution."""
        pass
```

### Error Handling Interface

```python
@dataclass
class StageError:
    stage: str
    error_type: str  # "timeout", "api_failure", "validation", "internal"
    message: str
    retry_count: int
    retryable: bool
    timestamp: datetime

class ErrorHandler:
    """Handles errors at stage level."""
    
    def handle(self, error: StageError) -> StageAction:
        """Determine action based on error type."""
        pass

@dataclass
class StageAction:
    action: str  # "retry", "skip", "abort", "fallback"
    delay_seconds: float = 0
    fallback_data: any = None
```

---

## Performance Targets

| Stage | Target | Max | Notes |
|-------|--------|-----|-------|
| Scan | 2s | 5s | API dependent |
| Research | 10s | 20s | Parallel execution |
| Predict | 5s | 10s | Model inference |
| Risk | 1s | 2s | Purely deterministic |
| Execute | 10s | 30s | Network + blockchain |
| Compound | 2s | 5s | Post-processing |
| **Total** | **30s** | **72s** | End-to-end |

---

## Retry Logic

```python
# pipeline/utils/retry.py

import asyncio
from functools import wraps
from typing import Callable, TypeVar

T = TypeVar('T')

async def retry_with_backoff(
    func: Callable[..., T],
    max_retries: int = 3,
    initial_delay: float = 1.0,
    backoff_factor: float = 2.0,
    exceptions: tuple = (Exception,)
) -> T:
    """
    Retry a function with exponential backoff.
    
    Args:
        func: Async function to retry
        max_retries: Maximum retry attempts
        initial_delay: First delay in seconds
        backoff_factor: Multiplier for each retry
        exceptions: Tuple of exceptions to catch
    
    Returns:
        Result of successful function call
    
    Raises:
        Last exception if all retries fail
    """
    delay = initial_delay
    last_error = None
    
    for attempt in range(max_retries + 1):
        try:
            return await func()
        except exceptions as e:
            last_error = e
            if attempt < max_retries:
                await asyncio.sleep(delay)
                delay *= backoff_factor
    
    raise last_error
```

---

## Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                        INPUT DATA                               │
│  - Market universe (CLOB API)                                   │
│  - Account state (balance, positions)                           │
│  - Configuration (limits, thresholds)                           │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│  SCAN STAGE                                                    │
│  Input: market_universe, filters                              │
│  Output: MarketCandidate[] (~50-100 markets)                   │
│  Persist: /state/scan_{run_id}.json                           │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│  RESEARCH STAGE                                                │
│  Input: MarketCandidate[], DataSource[]                        │
│  Output: MarketResearch[] per market                           │
│  Persist: /state/research_{run_id}.json                       │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│  PREDICT STAGE                                                 │
│  Input: MarketCandidate[], MarketResearch[]                    │
│  Output: Prediction[] with p_yes, p_no, edge, kelly           │
│  Persist: /state/predict_{run_id}.json                         │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│  RISK STAGE                                                    │
│  Input: Prediction[], Position[], RiskLimits                   │
│  Output: ApprovedTrade[] (0-5 trades typically)                │
│  Persist: /state/risk_{run_id}.json                           │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│  EXECUTE STAGE                                                 │
│  Input: ApprovedTrade[], CLOB credentials                       │
│  Output: ExecutedTrade[] with tx_hash, slippage                 │
│  Persist: /state/execute_{run_id}.json                        │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│  COMPOUND STAGE                                                │
│  Input: ExecutedTrade[], outcomes                               │
│  Output: ResolvedTrade[], KnowledgeUpdate[]                    │
│  Persist: /state/compound_{run_id}.json, /knowledge/            │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│                       OUTPUT DATA                               │
│  - Trade log (for audit)                                        │
│  - Brier score update                                           │
│  - Knowledge base updates                                       │
└────────────────────────────────────────────────────────────────┘
```

---

## Logging & Auditing

All stages log structured events:

```python
import logging
import json
from datetime import datetime

logger = logging.getLogger("pipeline")

def log_event(
    stage: str,
    event: str,
    data: dict,
    level: str = "INFO"
):
    """Log a structured event for audit trail."""
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "stage": stage,
        "event": event,
        "data": data,
        "level": level
    }
    logger.log(
        getattr(logging, level),
        json.dumps(log_entry)
    )
```

Example log entries:
```json
{"timestamp": "2026-03-09T21:30:01Z", "stage": "scan", "event": "start", "data": {"market_count": 312}, "level": "INFO"}
{"timestamp": "2026-03-09T21:30:03Z", "stage": "scan", "event": "complete", "data": {"candidates": 47}, "level": "INFO"}
{"timestamp": "2026-03-09T21:30:05Z", "stage": "research", "event": "source_timeout", "data": {"source": "twitter", "market": " btc-price"}, "level": "WARNING"}
```

---

## Next Steps

1. **Implement individual stages** (see `/pipeline/stages/`)
2. **Create unit tests** for each stage
3. **Build orchestrator** to run full pipeline
4. **Integrate with CLOB API** for execution
5. **Add monitoring** (Prometheus metrics, alerts)

---

**Document Version:** 1.0
**Last Updated:** 2026-03-09
**Author:** CTO Agent