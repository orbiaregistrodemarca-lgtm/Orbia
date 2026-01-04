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
  CheckCircle, AlertCircle, FileText, UserCheck, Scale
} from 'lucide-react';

const ESTADOS_MEXICO = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas",
  "Chihuahua", "Ciudad de México", "Coahuila", "Colima", "Durango", "Estado de México",
  "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit",
  "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí",
  "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
];

const WEBHOOK_TITULAR = 'https://n8n.srv1175451.hstgr.cloud/webhook/datos-titular';

type TipoPersona = 'persona_fisica' | 'persona_moral';

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
  const [razonSocial, setRazonSocial] = useState('');
  const [nacionalidad, setNacionalidad] = useState('Mexicana');
  const [domicilio, setDomicilio] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [estado, setEstado] = useState('');
  const [pais, setPais] = useState('México');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rfc, setRfc] = useState('');
  const [curp, setCurp] = useState('');
  const [representanteLegal, setRepresentanteLegal] = useState('');
  
  const [tieneApoderado, setTieneApoderado] = useState(false);
  const [apoderadoNombre, setApoderadoNombre] = useState('');
  const [apoderadoDomicilio, setApoderadoDomicilio] = useState('');

  useEffect(() => {
    const storedResult = localStorage.getItem('orbia_last_result');
    const storedInput = localStorage.getItem('orbia_last_input');
    
    if (!storedResult || !storedInput) {
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
      const parsedInput = JSON.parse(storedInput);
      
      setEstudioId(parsedResult.id || '');
      setNombreMarca(parsedInput.nombre_marca || '');
    } catch (e) {
      console.error('Error loading data:', e);
      setLocation('/clasificar');
    }
  }, [setLocation, toast]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (tipoPersona === 'persona_fisica') {
      if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
      if (!curp.trim()) {
        newErrors.curp = 'El CURP es obligatorio';
      } else if (curp.length !== 18) {
        newErrors.curp = 'El CURP debe tener 18 caracteres';
      }
      if (rfc && rfc.length !== 13) {
        newErrors.rfc = 'El RFC de persona física debe tener 13 caracteres';
      }
    } else {
      if (!razonSocial.trim()) newErrors.razonSocial = 'La razón social es obligatoria';
      if (rfc && rfc.length !== 12) {
        newErrors.rfc = 'El RFC de persona moral debe tener 12 caracteres';
      }
    }
    
    if (!domicilio.trim()) newErrors.domicilio = 'El domicilio es obligatorio';
    if (!email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'El formato del email no es válido';
    }
    
    if (tieneApoderado && !apoderadoNombre.trim()) {
      newErrors.apoderadoNombre = 'El nombre del apoderado es obligatorio';
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
      const titularData = tipoPersona === 'persona_fisica' 
        ? {
            tipo: 'persona_fisica',
            nombre,
            nacionalidad,
            domicilio,
            codigo_postal: codigoPostal,
            ciudad,
            estado,
            pais,
            email,
            telefono,
            rfc: rfc || undefined,
            curp,
          }
        : {
            tipo: 'persona_moral',
            razon_social: razonSocial,
            nacionalidad,
            domicilio,
            codigo_postal: codigoPostal,
            ciudad,
            estado,
            pais,
            email,
            telefono,
            rfc: rfc || undefined,
            representante_legal: representanteLegal || undefined,
          };

      const payload: any = {
        estudio_id: estudioId,
        titular: titularData,
      };

      if (tieneApoderado && apoderadoNombre) {
        payload.apoderado = {
          nombre: apoderadoNombre,
          domicilio: apoderadoDomicilio || undefined,
        };
      }

      console.log('📤 Enviando datos del titular:', payload);

      const response = await fetch(WEBHOOK_TITULAR, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('📥 Respuesta del webhook:', result);

      if (result.success) {
        setIsSuccess(true);
        localStorage.setItem('orbia_titular_data', JSON.stringify(payload));
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
    maxLength?: number
  ) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={id}
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
      <div className="container max-w-2xl mx-auto px-4 py-8">
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
    );
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <FileText className="w-4 h-4" />
            <span>MÓDULO 3</span>
            <span className="text-primary font-medium">• Paso 3 de 4</span>
          </div>
          <h1 className="text-3xl font-bold text-primary">Datos del Titular</h1>
          <p className="text-muted-foreground mt-1">
            Ingresa los datos de quien será el titular de la marca "{nombreMarca}"
          </p>
        </div>
        <OrbiaMascot state="idle" size="md" className="hidden sm:block" />
      </div>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div 
            key={step}
            className={`h-2 flex-1 rounded-full ${
              step <= 3 ? 'bg-primary' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Tipo de Titular
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
                Datos del Titular
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {tipoPersona === 'persona_fisica' ? (
                <>
                  {renderInput('nombre', 'Nombre completo', nombre, setNombre, true, 'Ej: Juan Pérez López')}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput('curp', 'CURP', curp, (v) => setCurp(v.toUpperCase()), true, 'PELJ800101HYNRPN09', 18)}
                    {renderInput('rfc', 'RFC', rfc, (v) => setRfc(v.toUpperCase()), false, 'PELJ800101ABC', 13)}
                  </div>
                </>
              ) : (
                <>
                  {renderInput('razonSocial', 'Razón Social', razonSocial, setRazonSocial, true, 'Ej: Empresa XYZ S.A. de C.V.')}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput('rfc', 'RFC', rfc, (v) => setRfc(v.toUpperCase()), false, 'EXY800101XYZ', 12)}
                    {renderInput('representanteLegal', 'Representante Legal', representanteLegal, setRepresentanteLegal, false, 'Nombre del representante')}
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('nacionalidad', 'Nacionalidad', nacionalidad, setNacionalidad, false)}
                {renderInput('pais', 'País', pais, setPais, false)}
              </div>

              {renderInput('domicilio', 'Domicilio completo', domicilio, setDomicilio, true, 'Calle, número, colonia')}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderInput('codigoPostal', 'Código Postal', codigoPostal, setCodigoPostal, false, '97000', 5)}
                {renderInput('ciudad', 'Ciudad', ciudad, setCiudad, false, 'Ej: Mérida')}
                
                <div className="space-y-2">
                  <Label htmlFor="estado" className="text-sm font-medium">Estado</Label>
                  <Select value={estado} onValueChange={setEstado}>
                    <SelectTrigger id="estado" data-testid="select-estado">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_MEXICO.map((est) => (
                        <SelectItem key={est} value={est}>{est}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('email', 'Email', email, setEmail, true, 'correo@ejemplo.com')}
                {renderInput('telefono', 'Teléfono', telefono, setTelefono, false, '9991234567', 10)}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Scale className="w-5 h-5 text-primary" />
                Apoderado Legal (Opcional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-4">
                <Checkbox
                  id="tieneApoderado"
                  checked={tieneApoderado}
                  onCheckedChange={(checked) => setTieneApoderado(checked === true)}
                  data-testid="checkbox-apoderado"
                />
                <Label htmlFor="tieneApoderado" className="cursor-pointer">
                  ¿Tienes un apoderado legal para este trámite?
                </Label>
              </div>

              <AnimatePresence>
                {tieneApoderado && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {renderInput('apoderadoNombre', 'Nombre del apoderado', apoderadoNombre, setApoderadoNombre, true, 'Ej: Lic. María García')}
                    {renderInput('apoderadoDomicilio', 'Domicilio del apoderado', apoderadoDomicilio, setApoderadoDomicilio, false, 'Dirección completa')}
                  </motion.div>
                )}
              </AnimatePresence>
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
  );
}
