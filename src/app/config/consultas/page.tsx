import { ConsultaHoursAdmin } from "@/components/ConsultaHoursAdmin";

export const dynamic = "force-dynamic";

export default function ConfigConsultasPage() {
  return (
    <div>
      <h2 className="font-serif text-2xl">Horario de consultas</h2>
      <div className="mt-6">
        <ConsultaHoursAdmin />
      </div>
    </div>
  );
}
