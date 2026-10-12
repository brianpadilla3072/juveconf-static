import { LODGING_NIGHTS, isMinor, type GuestExtra, type GuestExtraErrors } from '../lib/meals';

interface GuestExtraFieldsProps {
  index: number;
  birthdate: string;
  extra: GuestExtra;
  errors: GuestExtraErrors;
  onChange: (patch: Partial<GuestExtra>) => void;
}

const inputClass =
  'bg-black/20 text-white/80 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:border-white/20 focus:border-[#8B3FFF]/50 focus:ring-1 focus:ring-[#8B3FFF]/30 transition-colors';
const labelClass = 'text-sm font-medium text-white/80';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" data-field-error className="text-xs text-red-400">
      {message}
    </p>
  );
}

// Datos adicionales de inscripción del invitado. Solo se usa cuando el evento tiene comidas habilitadas.
export default function GuestExtraFields({ index, birthdate, extra, errors, onChange }: GuestExtraFieldsProps) {
  const minor = isMinor(birthdate);

  const toggleNight = (code: string) => {
    const nights = extra.lodgingNights.includes(code)
      ? extra.lodgingNights.filter((n) => n !== code)
      : [...extra.lodgingNights, code];
    onChange({ lodgingNights: nights });
  };

  return (
    <div className="grid gap-4 pt-4 border-t border-white/10">
      <p className="text-sm font-medium text-white/90">Datos complementarios</p>

      <div className="grid gap-2">
        <label className={labelClass} htmlFor={`guest-group-${index}`}>
          Grupo / líder <span className="text-white/50 font-normal">(opcional)</span>
        </label>
        <input
          type="text"
          id={`guest-group-${index}`}
          value={extra.group}
          onChange={(e) => onChange({ group: e.target.value })}
          className={inputClass}
          placeholder="Ej: Grupo de jóvenes / nombre del líder"
        />
      </div>

      {/* Alojamiento */}
      <div className="grid gap-2">
        <span className={labelClass}>Alojamiento</span>
        <label className="flex items-center gap-3 text-sm text-white/80 cursor-pointer">
          <input
            type="checkbox"
            checked={extra.lodgingNeeded}
            onChange={(e) =>
              onChange({ lodgingNeeded: e.target.checked, lodgingNights: e.target.checked ? extra.lodgingNights : [] })
            }
            className="w-4 h-4 accent-[#8B3FFF]"
          />
          Necesito alojamiento
        </label>
        {extra.lodgingNeeded && (
          <fieldset className="grid gap-2 pl-7">
            <legend className="text-xs text-white/60 mb-1">¿Qué noches?</legend>
            <div className="flex flex-wrap gap-4">
              {LODGING_NIGHTS.map((night) => (
                <label key={night.code} className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={extra.lodgingNights.includes(night.code)}
                    onChange={() => toggleNight(night.code)}
                    className="w-4 h-4 accent-[#8B3FFF]"
                  />
                  {night.label}
                </label>
              ))}
            </div>
            <FieldError message={errors.lodgingNights} />
          </fieldset>
        )}
      </div>

      <div className="grid gap-2">
        <label className={labelClass} htmlFor={`guest-dietary-${index}`}>
          Restricciones alimentarias o alergias <span className="text-white/50 font-normal">(opcional)</span>
        </label>
        <input
          type="text"
          id={`guest-dietary-${index}`}
          value={extra.dietary}
          onChange={(e) => onChange({ dietary: e.target.value })}
          className={inputClass}
          placeholder="Ej: celíaco, alergia a los frutos secos"
        />
      </div>

      {/* Contacto de emergencia */}
      <div className="grid gap-4">
        <span className={labelClass}>Contacto de emergencia</span>
        <div className="grid gap-2">
          <label className="text-xs text-white/60" htmlFor={`guest-emergency-name-${index}`}>
            Nombre y apellido
          </label>
          <input
            type="text"
            id={`guest-emergency-name-${index}`}
            value={extra.emergencyName}
            onChange={(e) => onChange({ emergencyName: e.target.value })}
            className={inputClass}
            placeholder="Ingresá el nombre del contacto"
          />
          <FieldError message={errors.emergencyName} />
        </div>
        <div className="grid gap-2">
          <label className="text-xs text-white/60" htmlFor={`guest-emergency-phone-${index}`}>
            Teléfono
          </label>
          <input
            type="tel"
            id={`guest-emergency-phone-${index}`}
            value={extra.emergencyPhone}
            onChange={(e) => onChange({ emergencyPhone: e.target.value })}
            className={inputClass}
            placeholder="291 5035 6245"
          />
          <FieldError message={errors.emergencyPhone} />
        </div>
      </div>

      {/* Responsable: solo para menores de 18 años */}
      {minor && (
        <div className="grid gap-4 bg-[#9810fa5b] border border-[#9810fa] rounded-lg p-4">
          <div className="grid gap-1">
            <span className="text-sm font-medium text-white">Responsable a cargo (menor de 18 años)</span>
            <p className="text-xs text-white/80">
              Como este invitado es menor de edad, completá los datos de su madre, padre o tutor/a.
            </p>
          </div>
          <div className="grid gap-2">
            <label className="text-xs text-white/80" htmlFor={`guest-guardian-name-${index}`}>
              Nombre y apellido
            </label>
            <input
              type="text"
              id={`guest-guardian-name-${index}`}
              value={extra.guardianName}
              onChange={(e) => onChange({ guardianName: e.target.value })}
              className={inputClass}
              placeholder="Ingresá el nombre del responsable"
            />
            <FieldError message={errors.guardianName} />
          </div>
          <div className="grid gap-2">
            <label className="text-xs text-white/80" htmlFor={`guest-guardian-dni-${index}`}>
              DNI
            </label>
            <input
              type="text"
              id={`guest-guardian-dni-${index}`}
              value={extra.guardianDni}
              onChange={(e) => onChange({ guardianDni: e.target.value })}
              className={inputClass}
              placeholder="Ej: 12345678"
            />
            <FieldError message={errors.guardianDni} />
          </div>
          <div className="grid gap-2">
            <label className="text-xs text-white/80" htmlFor={`guest-guardian-phone-${index}`}>
              Teléfono
            </label>
            <input
              type="tel"
              id={`guest-guardian-phone-${index}`}
              value={extra.guardianPhone}
              onChange={(e) => onChange({ guardianPhone: e.target.value })}
              className={inputClass}
              placeholder="291 5035 6245"
            />
            <FieldError message={errors.guardianPhone} />
          </div>
        </div>
      )}
    </div>
  );
}
