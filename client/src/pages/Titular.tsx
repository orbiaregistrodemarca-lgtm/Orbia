import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrbiaMascot } from '@/components/mascot/OrbiaMascot';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Building2, ArrowRight, ArrowLeft, Loader2, 
  CheckCircle, AlertCircle, FileText, UserCheck, Scale,
  MapPin, Mail, Phone, Stamp, CalendarDays
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ESTADOS_MEXICO = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas",
  "Chihuahua", "Ciudad de México", "Coahuila", "Colima", "Durango", "Estado de México",
  "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit",
  "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí",
  "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
];

const WEBHOOK_TITULAR = 'https://n8n.srv1175451.hstgr.cloud/webhook/datos-titular';

type TipoPersona = 'persona_fisica' | 'persona_moral';
type TipoSigno = 'marca';

interface FormErrors {
  [key: string]: string;
}

export default function Titular() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [estudioId, setEstudioId] = useState('');
  const [nombreMarca, setNombreMarca] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [tipoPersona, setTipoPersona] = useState<TipoPersona>('persona_fisica');
  
  const [nombre, setNombre] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [curp, setCurp] = useState('');
  
  const [razonSocial, setRazonSocial] = useState('');
  const [rfc, setRfc] = useState('');
  
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [nacionalidad, setNacionalidad] = useState('Mexicana');
  
  const [calle, setCalle] = useState('');
  const [numExterior, setNumExterior] = useState('');
  const [numInterior, setNumInterior] = useState('');
  const [colonia, setColonia] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [estado, setEstado] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [pais, setPais] = useState('México');
  
  const tipoSigno: TipoSigno = 'marca';
  const [noSeHaUsado, setNoSeHaUsado] = useState(true);
  const [fechaPrimerUso, setFechaPrimerUso] = useState('');
  const [nombreFirmante, setNombreFirmante] = useState('');

  useEffect(() => {
    const storedResult = localStorage.getItem('orbia_last_result');
    
    if (!storedResult) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Primero debes clasificar tu marca",
      });
      setLocation('/clasificar');
      return;
    }

    try {
      const parsedResult = JSON.parse(storedResult);
      setEstudioId(parsedResult.id || '');
      setNombreMarca(parsedResult.nombre_marca || '');
    } catch (e) {
      console.error('Error loading data:', e);
      setLocation('/clasificar');
    }
  }, [setLocation, toast]);

  const getNombreCompleto = () => {
    if (tipoPersona === 'persona_fisica') {
      return [nombre, apellidoPaterno, apellidoMaterno].filter(Boolean).join(' ');
    }
    return razonSocial;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (tipoPersona === 'persona_fisica') {
      if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
      if (!apellidoPaterno.trim()) newErrors.apellidoPaterno = 'El primer apellido es obligatorio';
      if (!curp.trim()) {
        newErrors.curp = 'El CURP es obligatorio';
      } else if (curp.length !== 18) {
        newErrors.curp = 'El CURP debe tener 18 caracteres';
      }
    } else {
      if (!razonSocial.trim()) newErrors.razonSocial = 'La razón social es obligatoria';
      if (!rfc.trim()) {
        newErrors.rfc = 'El RFC es obligatorio';
      } else if (rfc.length !== 12) {
        newErrors.rfc = 'El RFC de persona moral debe tener 12 caracteres';
      }
    }
    
    if (!email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'El formato del email no es válido';
    }
    
    if (!calle.trim()) newErrors.calle = 'La calle es obligatoria';
    if (!numExterior.trim()) newErrors.numExterior = 'El número exterior es obligatorio';
    if (!colonia.trim()) newErrors.colonia = 'La colonia es obligatoria';
    if (!municipio.trim()) newErrors.municipio = 'El municipio es obligatorio';
    if (!estado.trim()) newErrors.estado = 'El estado es obligatorio';
    if (!codigoPostal.trim()) newErrors.codigoPostal = 'El código postal es obligatorio';

    if (!noSeHaUsado && !fechaPrimerUso) {
      newErrors.fechaPrimerUso = 'La fecha de primer uso es obligatoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Datos incompletos",
        description: "Por favor revisa los campos marcados en rojo",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const firmante = nombreFirmante.trim() || getNombreCompleto();
      
      const payload = {
        estudio_id: estudioId,
        titular: {
          tipo: tipoPersona,
          nombre: tipoPersona === 'persona_fisica' ? nombre : null,
          apellido_paterno: tipoPersona === 'persona_fisica' ? apellidoPaterno : null,
          apellido_materno: tipoPersona === 'persona_fisica' ? apellidoMaterno || null : null,
          curp: tipoPersona === 'persona_fisica' ? curp : null,
          razon_social: tipoPersona === 'persona_moral' ? razonSocial : null,
          rfc: tipoPersona === 'persona_moral' ? rfc : null,
          email,
          telefono: telefono || null,
          nacionalidad,
          calle,
          num_exterior: numExterior,
          num_interior: numInterior || "",
          colonia,
          municipio,
          estado,
          codigo_postal: codigoPostal,
          pais,
          tipo_signo: tipoSigno,
          no_se_ha_usado: noSeHaUsado,
          fecha_primer_uso: noSeHaUsado ? null : fechaPrimerUso,
          nombre_firmante: firmante,
        }
      };

      console.log('📤 Enviando datos del titular:', payload);

      const response = await fetch(WEBHOOK_TITULAR, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('📥 Respuesta raw:', responseText);
      
      let result;
      try {
        const parsed = JSON.parse(responseText);
        result = Array.isArray(parsed) ? parsed[0] : parsed;
      } catch {
        throw new Error('Respuesta inválida del servidor');
      }
      
      console.log('📥 Respuesta del webhook:', result);

      if (result.success) {
        setIsSuccess(true);
        localStorage.setItem('orbia_titular_data', JSON.stringify(payload));
        localStorage.setItem('datos_completados', 'true');
        toast({
          title: "Datos guardados",
          description: result.mensaje || "Los datos del titular se guardaron correctamente",
        });
      } else {
        const errorMsg = result.errores?.join(', ') || result.mensaje || 'Error desconocido';
        toast({
          variant: "destructive",
          title: "Error al guardar",
          description: errorMsg,
        });
      }
    } catch (error) {
      console.error('❌ Error:', error);
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (
    id: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    required: boolean = false,
    placeholder?: string,
    maxLength?: number,
    type: string = 'text'
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        data-testid={`input-${id}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={errors[id] ? 'border-red-500' : ''}
      />
      {errors[id] && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {errors[id]}
        </p>
      )}
    </div>
  );

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <OrbiaMascot state="happy" size="lg" />
            </div>
            
            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="pt-8 pb-8">
                <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-emerald-800 mb-2">
                  Datos guardados exitosamente
                </h2>
                <p className="text-emerald-700 mb-6">
                  Los datos del titular han sido registrados correctamente.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => setLocation('/solicitud')}
                    className="bg-primary"
                    data-testid="button-continue"
                  >
                    Continuar a Generar Solicitud
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setIsSuccess(false)}
                    data-testid="button-edit"
                  >
                    Editar datos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm font-medium border-primary/30 bg-primary/5">
            Paso 3 de 4
          </Badge>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Datos del Titular
          </h1>
          <p className="text-muted-foreground">
            Ingresa los datos de quien será el titular de la marca "{nombreMarca}"
          </p>
        </motion.div>

        <div className="flex justify-center mb-6">
          <OrbiaMascot state="idle" size="md" />
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              Tipo de Persona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTipoPersona('persona_fisica')}
                data-testid="button-persona-fisica"
                className={`p-6 rounded-xl border-2 text-left transition-all ${
                  tipoPersona === 'persona_fisica'
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <User className={`w-8 h-8 mb-3 ${
                  tipoPersona === 'persona_fisica' ? 'text-primary' : 'text-slate-400'
                }`} />
                <h3 className="font-semibold mb-1">Persona Física</h3>
                <p className="text-sm text-muted-foreground">
                  Individuo o profesionista independiente
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTipoPersona('persona_moral')}
                data-testid="button-persona-moral"
                className={`p-6 rounded-xl border-2 text-left transition-all ${
                  tipoPersona === 'persona_moral'
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Building2 className={`w-8 h-8 mb-3 ${
                  tipoPersona === 'persona_moral' ? 'text-primary' : 'text-slate-400'
                }`} />
                <h3 className="font-semibold mb-1">Persona Moral</h3>
                <p className="text-sm text-muted-foreground">
                  Empresa o sociedad constituida
                </p>
              </motion.button>
            </div>
          </CardContent>
        </Card>

        <AnimatePresence mode="wait">
          <motion.div
            key={tipoPersona}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-primary" />
                  {tipoPersona === 'persona_fisica' ? 'Datos Personales' : 'Datos de la Empresa'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tipoPersona === 'persona_fisica' ? (
                  <>
                    {renderInput('nombre', 'Nombre(s)', nombre, setNombre, true, 'Ej: Juan')}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderInput('apellidoPaterno', 'Primer apellido', apellidoPaterno, setApellidoPaterno, true, 'Ej: Pérez')}
                      {renderInput('apellidoMaterno', 'Segundo apellido', apellidoMaterno, setApellidoMaterno, false, 'Ej: López')}
                    </div>
                    {renderInput('curp', 'CURP', curp, (v) => setCurp(v.toUpperCase()), true, 'PELJ800101HDFRZN09', 18)}
                  </>
                ) : (
                  <>
                    {renderInput('razonSocial', 'Razón Social', razonSocial, setRazonSocial, true, 'Ej: Empresa XYZ S.A. de C.V.')}
                    {renderInput('rfc', 'RFC', rfc, (v) => setRfc(v.toUpperCase()), true, 'EXY800101XYZ', 12)}
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Datos de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('email', 'Email', email, setEmail, true, 'correo@ejemplo.com')}
                  {renderInput('telefono', 'Teléfono', telefono, setTelefono, false, '5512345678', 10)}
                </div>
                {renderInput('nacionalidad', 'Nacionalidad', nacionalidad, setNacionalidad, false)}
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Domicilio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderInput('calle', 'Calle', calle, setCalle, true, 'Ej: Av. Insurgentes Sur')}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('numExterior', 'Número exterior', numExterior, setNumExterior, true, 'Ej: 350')}
                  {renderInput('numInterior', 'Número interior', numInterior, setNumInterior, false, 'Ej: Depto 4A')}
                </div>

                {renderInput('colonia', 'Colonia', colonia, setColonia, true, 'Ej: Hipódromo')}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('municipio', 'Municipio / Alcaldía', municipio, setMunicipio, true, 'Ej: Cuauhtémoc')}
                  
                  <div className="space-y-2">
                    <Label htmlFor="estado" className="text-sm font-medium">
                      Estado <span className="text-red-500">*</span>
                    </Label>
                    <Select value={estado} onValueChange={setEstado}>
                      <SelectTrigger id="estado" data-testid="select-estado" className={errors.estado ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {ESTADOS_MEXICO.map((est) => (
                          <SelectItem key={est} value={est}>{est}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.estado && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.estado}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('codigoPostal', 'Código Postal', codigoPostal, setCodigoPostal, true, 'Ej: 06100', 5)}
                  {renderInput('pais', 'País', pais, setPais, false)}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stamp className="w-5 h-5 text-primary" />
                  Datos del Signo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg border">
                  <Checkbox
                    id="noSeHaUsado"
                    checked={noSeHaUsado}
                    onCheckedChange={(checked) => setNoSeHaUsado(checked === true)}
                    data-testid="checkbox-no-se-ha-usado"
                  />
                  <Label htmlFor="noSeHaUsado" className="cursor-pointer text-sm">
                    Aún no he usado esta marca en México
                  </Label>
                </div>

                <AnimatePresence>
                  {!noSeHaUsado && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      {renderInput('fechaPrimerUso', 'Fecha de primer uso', fechaPrimerUso, setFechaPrimerUso, true, '', undefined, 'date')}
                    </motion.div>
                  )}
                </AnimatePresence>

                {renderInput('nombreFirmante', 'Nombre para firma', nombreFirmante, setNombreFirmante, false, getNombreCompleto() || 'Nombre completo del firmante')}
                <p className="text-xs text-muted-foreground -mt-2">
                  Si lo dejas vacío, se usará el nombre del titular
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-6 text-lg bg-primary"
            data-testid="button-submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                Guardar y Continuar
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setLocation('/logo')}
            className="py-6"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    </div>
  );
}
