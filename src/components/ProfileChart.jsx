import { useMemo } from "react";
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ArrowRightLeft, Activity, Info } from "lucide-react";
import { generateProfile, isNum } from "../engine.js";

export default function ProfileChart({ solution }) {
  const { Th_in, Th_out, Tc_in, Tc_out, Ch, Cc, Q, isParallel, hot, cold } = solution;
  const hotName = hot?.nombre || "el fluido caliente";
  const coldName = cold?.nombre || "el fluido frío";

  // Qué temperaturas específicas faltan (para explicarlo, no solo omitir la
  // gráfica en silencio como si fuera un error). No incluye Ch/Cc: si esas
  // faltan pero las 4 temperaturas sí se conocen, es un caso raro que no
  // vale la pena explicar con el mismo detalle.
  const missingTemps = [];
  if (!isNum(Th_in)) missingTemps.push(`T entrada de ${hotName}`);
  if (!isNum(Th_out)) missingTemps.push(`T salida de ${hotName}`);
  if (!isNum(Tc_in)) missingTemps.push(`T entrada de ${coldName}`);
  if (!isNum(Tc_out)) missingTemps.push(`T salida de ${coldName}`);

  const data = useMemo(() => {
    if (![Th_in, Th_out, Tc_in, Tc_out, Q].every(isNum)) return null;
    if (!isNum(Ch) && Ch !== Infinity) return null;
    if (!isNum(Cc) && Cc !== Infinity) return null;
    return generateProfile(isParallel, Th_in, Th_out, Tc_in, Tc_out, Ch, Cc, Q);
  }, [Th_in, Th_out, Tc_in, Tc_out, Ch, Cc, Q, isParallel]);

  if (!data) {
    // Si las 4 temperaturas SÍ se conocen pero falta Ch/Cc (caso raro), no
    // hay una explicación tan clara que dar — se mantiene el comportamiento
    // anterior de no mostrar nada en vez de una nota confusa.
    if (!missingTemps.length) return null;
    return (
      <div className="hxs-card">
        <div className="hxs-section-title">
          <Activity size={15} color="var(--copper)" /> Perfil de temperatura a lo largo del intercambiador
        </div>
        <div className="hxs-alert hxs-alert-info">
          <Info size={14} />
          No se puede graficar el perfil: falta{missingTemps.length > 1 ? "n" : ""} {missingTemps.join(", ")}. El
          enunciado no da la suficiente informacion para determinar{missingTemps.length > 1 ? "las" : "la"} con una única
          respuesta.
        </div>
      </div>
    );
  }

  return (
    <div className="hxs-card">
      <div className="hxs-section-title">
        <Activity size={15} color="var(--copper)" /> Perfil de temperatura a lo largo del intercambiador
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--ink-dim)", marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>
        <ArrowRightLeft size={12} />
        {isParallel ? "flujo paralelo" : "contraflujo"}
      </div>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 8, right: 14, left: -6, bottom: 8 }}>
            <CartesianGrid stroke="rgba(201,184,156,0.1)" />
            <XAxis
              dataKey="x"
              type="number"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: "#8D9298", fontSize: 10.5, fontFamily: "JetBrains Mono" }}
              label={{ value: "Posición a lo largo del intercambiador", position: "insideBottom", offset: -4, fill: "#8D9298", fontSize: 10.5 }}
            />
            <YAxis
              tick={{ fill: "#8D9298", fontSize: 10.5, fontFamily: "JetBrains Mono" }}
              label={{ value: "T (°C)", angle: -90, position: "insideLeft", fill: "#8D9298", fontSize: 10.5 }}
            />
            <Tooltip
              contentStyle={{ background: "#12151A", border: "1px solid rgba(201,184,156,0.25)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "#8D9298" }}
              formatter={(v, name) => [`${v.toFixed(1)} °C`, name]}
              labelFormatter={(l) => `${l}%`}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => <span style={{ color: "var(--ink)" }}>{v}</span>} />
            <Line type="monotone" dataKey="Th" name={hotName} stroke="var(--copper)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="Tc" name={coldName} stroke="var(--steel)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
