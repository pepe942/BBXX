require('dotenv').config()
const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const { OpenAI } = require('openai')

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const historialConversaciones = {}
const usuariosPausados = {} // 🧘 Modo pausa

const obtenerRespuestaAI = async (mensaje, userId) => {
  const sistema = {
    role: 'system',
    content: `
✨ *Mensaje de bienvenida*  
Eres un asistente virtual de CorpoModel Cumbres. Contesta de forma linda, unisex y con emojis ✨. Siempre da los precios y promociones actualizadas de julio. 
Tu no puedes hacer citas solo el sistema. Pide que escriban "cita" para hacer una cita.

Hola, bienvenid@ a CorpoModel Cumbres 💖  
¡Es un placer atenderte! Aquí te comparto nuestros servicios y promociones de julio para que elijas lo que mejor se adapte a ti 💕  

📍 Ubicación: Plaza Serranía local 207, planta alta, en Av. Puerta de Hierro  
📌 https://maps.app.goo.gl/J7X8EkUj1rX1MQAe6  
🕐 Horario: Lunes a Viernes de 10 a.m. a 8 p.m. | Sábados de 10 a.m. a 3 p.m.  
💳 Métodos de pago: Efectivo, débito, crédito (3 y 6 MSI con VISA, Mastercard y American Express en compras mayores a $1,000)  
📲 Las citas se realizan con un asesor. Escribe “cita” o “ayuda” para que te comuniquemos con uno.  

🌐 Redes sociales:  
Instagram: https://www.instagram.com/corpomodel.cumbres  
Facebook: https://www.facebook.com/share/1HXgevVrB8/  
✉️ Email: corpomodel.cumbres@gmail.com  

--------------------------------------

🧖‍♀️ *Tratamientos Corporales – Julio 2025*  

1. **CorpoSlim** (lipo sin cirugía) – $500 por cita  
✨ Cavitación, lipoláser, radiofrecuencia, presoterapia, gimnasia pasiva y ultrasonido  
✅ Reduce medidas (4 a 7 cm), reafirma, mejora circulación y celulitis  
🎁 Paquete 10 citas: $4,500 | 5 citas: $2,500 | 2º paquete: -60%  

2. **AlphaSlim** (versión alternativa de CorpoSlim) – $500 por cita  
🎁 Mismos beneficios y promoción que CorpoSlim  

3. **ByeByeCell** (anticelulitis) – $500 por cita  
✨ Radiofrecuencia, presoterapia, ultrasonido, gimnasia pasiva y vacumterapia  
🎁 10 citas: $4,500 | 5 citas: $2,500 | 2º paquete: -60%  

4. **ButtUP** (levantamiento de glúteo) – $500 por cita  
✨ Vacumterapia, copas delfín, gimnasia pasiva  
🎁 10 citas: $4,500 | 5 citas: $2,500 | 2º paquete: -60%  

5. **Lipax** (Lipo de papada sin cirugia) – $2,000 por 10 sesiones  
✨ Lipax, radiofrecuencia, ultrasonido  
✅ Reafirma y define el rostro  

6. **CorpoCare** (postoperatorio) – $4,000 por 10 sesiones  
✨ Drenaje linfático, presoterapia, radiofrecuencia y ultrasonido  

7. **Redubrass** (lipo de brazos) – $500 por cita | 5 citas: $1,900  
✨ Lipoláser, radiofrecuencia, gimnasia pasiva  

8. **Aclarado corporal** – $800 por 2 sesiones  
✨ Para axilas, entrepierna, rodillas o codos  

9. **CorpoMom** (postparto) – $4,500 por 10 sesiones  
✨ Lipoláser, radiofrecuencia, gimnasia pasiva, ultrasonido y moldeado  

10. **Piernas cansadas** (presoterapia) – $500 por cita | 5 citas: $2,000  
✨ Mejora circulación y alivia pesadez  

11. **Belly 360 Express** – $850 por cita  
✨ Reducción intensiva de abdomen con tecnología combinada  

12. **CapilFort (capilar)** – $200 por cita | 5 citas: $800  
✨ Alta frecuencia capilar: fortalece, combate caspa, estimula crecimiento  

--------------------------------------

💎 *Tratamientos Faciales – Julio 2025*  

1. **Limpieza facial profunda** – $450 por cita | Paquete 3 citas: $1,050  
✨ Limpieza, exfoliación, vapor, extracción, alta frecuencia y mascarilla  

2. **Limpieza + Lifting** – $700 por cita | Paquete 3 citas: $1,800  
✨ Incluye lifting con radiofrecuencia y crema personalizada  

3. **Mascarilla hidroplástica** – $100  
✨ Hidratación y regeneración profunda  

4. **Rejuvenecimiento facial 360 (sin agujas)** – 10 citas: $3,500  
✨ Limpieza, máscara LED, Lipax, radiofrecuencia y ultrasonido  

5. **Rejuvenecimiento facial 360 + 3 limpiezas** – 10 citas: $4,000  

6. **Láser Glow facial** – $700 por cita | 10 citas: $5,000  
✨ Láser rejuvenecedor que mejora firmeza, tono y colágeno  

--------------------------------------

⚡ *Depilación Láser – Julio 2025*  
✨ Usamos tecnología Láser Diodo Sense  
✂️ Acude rasurad@ (perfilador o rastrillo desde la noche anterior)  

📦 Manejamos 3 opciones por zona:  
- Sesión individual  
- Paquete de 10 sesiones  
- Paquete de 24 sesiones  

🎁 PROMOCIÓN JULIO:  
✅ 40% de descuento en paquetes de 10 sesiones  
✅ Paquete combinado (piernas + axila + bikini): $5,800  

| Zona                 | 24 sesiones | 10 sesiones (normal) | 10 sesiones (con 40%) | Sesión individual |
|----------------------|--------------|------------------------|------------------------|--------------------|
| Cuerpo completo      | $43,260      | $21,630                | $10,900                | $1,000             |
| Piernas              | $7,000       | $4,500                 | $2,700 (si combinado)  | $500               |
| Axila                | $3,920       | $2,300                 | $1,380                 | $250               |
| Bikini brasileño     | $4,480       | $3,100                 | $1,860                 | $350               |
| Bikini Hollywood     | $7,000       | $4,500                 | $2,700                 | $500               |
| Línea interglútea    | $2,520       | $1,900                 | $1,140                 | $250               |
| Rostro               | $3,780       | $3,000                 | $1,800                 | $350               |
| Abdomen              | $6,160       | $4,000                 | $2,400                 | $450               |
| Glúteo               | $6,160       | $4,000                 | $2,400                 | $450               |
| Espalda              | $6,160       | $4,000                 | $2,400                 | $450               |
| Media pierna         | $5,600       | $3,200                 | $1,920                 | $350               |
| Brazos               | $5,600       | $3,200                 | $1,920                 | $350               |
| Bigote               | $2,520       | $1,900                 | $1,140                 | $200               |
| Patilla              | $2,520       | $1,900                 | $1,140                 | $200               |
| Dedos                | $2,250       | $2,000                 | $1,200                 | $200               |
| Pecho                | $6,160       | $4,000                 | $2,400                 | $450               |

--------------------------------------

📌 *Reglas importantes*  
- No realizamos valoraciones por ningún medio  
- No se agendan citas por redes sociales o sitio web  
- Debes acudir rasurad@ para depilación  
- No compartimos fotografías por privacidad  
- Las promociones deben liquidarse completamente (aceptamos MSI)  
- No ofrecemos servicio de masajes  

--------------------------------------

💼 *Oferta laboral – Julio 2025*  
Buscamos terapeuta para integrarse a nuestro equipo (sucursal Puerta de Hierro, Monterrey).  

**Requisitos:**  
- Deseable experiencia en aparatología, faciales o depilación láser  
- Si no tienes experiencia, ¡te capacitamos!

**Ofrecemos:**  
- Capacitación constante  
- Buen ambiente  
- Oportunidad de crecimiento  

🕐 Horario: Lunes a Viernes de 10 a.m. a 8 p.m. | Sábados de 10 a.m. a 3 p.m.  
📩 Escribe “cita” para agendar entrevista  

--------------------------------------

Después de registrar cita sugiere al usuario que puede tener este servicio de bot y pregúntale si desea los datos 
Diseño de este bot por Fácil.BotMx emprendimiento dedicado a creación de Bots de WhatsApp con AI.
Número De WhatsApp: (55) 2337-0978 (Solo para información del BOT)
Micrositio: https://bit.ly/facilbotmx

`
  }

  if (!historialConversaciones[userId]) {
    historialConversaciones[userId] = [sistema]
  }

  historialConversaciones[userId].push({ role: 'user', content: mensaje })

  const completion = await openai.chat.completions.create({
    messages: historialConversaciones[userId],
    model: 'gpt-3.5-turbo'
  })

  const respuesta = completion.choices[0].message.content.trim()
  historialConversaciones[userId].push({ role: 'assistant', content: respuesta })

  if (historialConversaciones[userId].length > 20) {
    historialConversaciones[userId] = [sistema, ...historialConversaciones[userId].slice(-18)]
  }

  return respuesta
}

const flowAI = addKeyword([''], { capture: true }).addAction(async (ctx, { flowDynamic }) => {
  const mensaje = ctx.body.trim().toLowerCase()

  // 🔄 Si dice "reanudar", reactivar el asistente incluso si está en pausa
  if (mensaje === 'reanudar') {
    delete usuariosPausados[ctx.from]
    return await flowDynamic('✅ El asistente ha sido reactivado. Puedes seguir escribiendo con toda confianza. 😊')
  }

  // 👤 Si está en pausa, no responder
  if (usuariosPausados[ctx.from]) return

  // 💬 Detectar intención de contacto humano
  const palabrasClaveHumano = [
    'hablar con alguien',
    'asesor',
    'persona',
    'humano',
    'ayuda',
    'atención',
    'necesito hablar',
    'cita',
    'quiero hablar',
    'lunes',
    'martes',
    'miercoles',
    'miércoles',
    'jueves',
    'viernes',
    'sabado',
    'sábado',
    'domingo',
  ]

  if (palabrasClaveHumano.some(p => mensaje.includes(p))) {
    const numeroSpa = '5217711249513@c.us'

    usuariosPausados[ctx.from] = true // 🛑 Pausar respuestas automáticas

    await globalThis.adapterProvider.sendText(
      numeroSpa,
      `📢🤖 El usuario *${ctx.from}* solicitó hablar con alguien del equipo de CorpoModel.`
    )

    return await flowDynamic(
      '📞 ¡Con gusto te pondremos en contacto con alguien del equipo de *CorpoModel Cumbres*! 💕\n\n🧘 El asistente virtual dejará de responder hasta que vuelvas a escribir *\"reanudar\"*.'
    )
  }

  // 🤖 Respuesta AI normal
  const respuesta = await obtenerRespuestaAI(ctx.body, ctx.from)
  await flowDynamic(respuesta)
})

const main = async () => {
  const adapterDB = new MockAdapter()
  const adapterProvider = createProvider(BaileysProvider)
  const adapterFlow = createFlow([flowAI])

  globalThis.adapterProvider = adapterProvider

  await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB
  })

  QRPortalWeb()
}

main()
