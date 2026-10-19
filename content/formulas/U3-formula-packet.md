# Unit 3 formula packet

public-student | All competition levels | F19–F28. Units 1–2 formula files remain unchanged.

Use supplied constants. Water c=4.18 J/(g·°C)=4180 J/(kg·K) is a rounded teaching value near ordinary liquid conditions. No Stefan–Boltzmann calculations are required here.

## F19 - Spatial temperature gradient
G=(T_hot−T_cold)/L

Variables: G: K/m; T_hot,T_cold: °C or K; difference only; L: m

Use: Magnitude for a specified uniform path; do not confuse position with time.

Mini example: (40−20) K/.05 m=400 K/m.

## F20 - Steady slab conduction
P_cond=kAΔT/L

Variables: P_cond: W; k: W/(m·K); A: m²; ΔT: K; L: m

Use: Uniform k, steady one-dimensional conduction and negligible edge/contact complications; face temperatures specified.

Mini example: .05×.20×10/.02=5 W.

## F21 - Infer conductivity
k=P_cond L/(AΔT)

Variables: k: W/(m·K); P_cond: W; L: m; A: m²; ΔT: K

Use: Use actual conducted power, not an uncorrected heater rating.

Mini example: 2 W×.01 m/(.02 m²×10 K)=.10 W/(m·K).

## F22 - Radiation partition
α+ρ+τ=1; P_abs=αP_inc

Variables: α,ρ,τ: dimensionless fractions; P_abs,P_inc: W

Use: Fractions refer to the specified incident radiation. Here ρ is reflectivity, not density.

Mini example: α=.7 and P_inc=10 W give P_abs=7 W.

## F23 - Sample heat capacity
C=mc; Q=CΔT

Variables: C: J/K; m: g; c: J/(g·°C); Q: J; ΔT: K or °C change

Use: Constant c, single phase and stated sensible-heat model; C depends on mass.

Mini example: 50 g×4 J/(g·°C)=200 J/K; 5 K rise needs1000 J.

## F24 - Ideal two-part mixing
T_f=(C_1T_1+C_2T_2)/(C_1+C_2)

Variables: C_1,C_2: J/K; T_1,T_2,T_f: same temperature scale

Use: Isolated, constant capacities, negligible work and no phase change; add cup terms as required.

Mini example: (100×60+300×20)/400=30 °C.

## F25 - Boundary energy ledger
Q_net=ΣQ_in−ΣQ_out

Variables: Q_net,Q_in,Q_out: J

Use: Add distinct crossings over the same interval; do not add successive descriptions of the same path.

Mini example: 500 J+200 J−100 J=600 J.

## F26 - Power from a temperature interval
P_avg=C_total(T_2−T_1)/(t_2−t_1)

Variables: P_avg: W; C_total: J/K; T: °C or K; t: s

Use: Known constant capacity, common temperature, no phase change or significant work.

Mini example: 400 J/K×3 K/120 s=10 W.

## F27 - Area and thickness conversions
1 cm²=0.0001 m²; 1 mm=0.001 m

Variables: A: m²; L: m

Use: Square the length conversion when converting area.

Mini example: 300 cm²=.0300 m²;6 mm=.006 m.

## F28 - Combined temperature prediction
T_f=T_i+(P_in−P_out)Δt/C_total

Variables: P_in,P_out: W; Δt: s; C_total: J/K; T_i,T_f: °C

Use: Rates constant or interval-averaged; distinct boundary paths and same-temperature parts; no phase change.

Mini example: 20 °C+(10−4) W×100 s/(300 J/K)=22 °C.
