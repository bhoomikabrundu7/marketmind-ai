from fastapi import APIRouter
from backend.app.schemas.simulator import SimulationRequest, SimulationResponse, SimulationScenario

router = APIRouter()

@router.post("/calculate", response_model=SimulationResponse)
async def calculate_simulation(req: SimulationRequest):
    months = req.years * 12
    
    def run_calc(annual_rate: float):
        r = annual_rate / 100 / 12
        if req.mode.upper() == "SIP":
            invested = req.amount * months
            fv = req.amount * (((1 + r) ** months - 1) / r) * (1 + r) if r > 0 else invested
        else:
            invested = req.amount
            fv = req.amount * ((1 + annual_rate / 100) ** req.years)
        return round(fv, 2), round(fv - invested, 2), round(invested, 2)

    exp_fv, exp_gain, invested = run_calc(req.expected_return_pct)
    cons_fv, cons_gain, _ = run_calc(max(1.0, req.expected_return_pct - 3.0))
    opt_fv, opt_gain, _ = run_calc(req.expected_return_pct + 4.0)

    return SimulationResponse(
        mode=req.mode.upper(),
        invested_amount=invested,
        years=req.years,
        conservative=SimulationScenario(
            label="Conservative Scenario",
            return_pct=max(1.0, req.expected_return_pct - 3.0),
            future_value=cons_fv,
            gain=cons_gain
        ),
        expected=SimulationScenario(
            label="Expected Model Scenario",
            return_pct=req.expected_return_pct,
            future_value=exp_fv,
            gain=exp_gain
        ),
        optimistic=SimulationScenario(
            label="Optimistic Scenario",
            return_pct=req.expected_return_pct + 4.0,
            future_value=opt_fv,
            gain=opt_gain
        )
    )