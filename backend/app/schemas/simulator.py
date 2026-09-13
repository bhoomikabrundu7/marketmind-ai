from typing import Optional
from pydantic import BaseModel, Field

class SimulationRequest(BaseModel):
    symbol: Optional[str] = "RELIANCE.NS"
    mode: str = Field("SIP", description="SIP or Lumpsum")
    amount: float = Field(10000.0, gt=0)
    years: int = Field(5, ge=1, le=30)
    expected_return_pct: float = Field(10.0, ge=0.1, le=50.0)

class SimulationScenario(BaseModel):
    label: str
    return_pct: float
    future_value: float
    gain: float

class SimulationResponse(BaseModel):
    mode: str
    invested_amount: float
    years: int
    conservative: SimulationScenario
    expected: SimulationScenario
    optimistic: SimulationScenario