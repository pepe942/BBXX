const { google } = require('googleapis')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
require('dayjs/locale/es')

const credentials = require('./credenciales-google.json')

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('es')

const calendar = google.calendar({ version: 'v3' })

const auth = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ['https://www.googleapis.com/auth/calendar']
)

const calendarId = 'aguilar2494@gmail.com'

const verificarDisponibilidad = async ({ fecha, hora }) => {
    await auth.authorize()
    const fechaInicio = dayjs.tz(`${fecha} ${hora}`, 'YYYY-MM-DD HH:mm', 'America/Mexico_City')
    const fechaFin = fechaInicio.add(1, 'hour')

    const res = await calendar.events.list({
        auth,
        calendarId,
        timeMin: fechaInicio.toISOString(),
        timeMax: fechaFin.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
    })

    return res.data.items.length === 0
}

const obtenerHorariosDisponibles = async (fecha) => {
    await auth.authorize()

    const horariosPropuestos = []
    const dia = dayjs.tz(fecha, 'YYYY-MM-DD', 'America/Mexico_City').day()
    const finHora = dia === 6 ? 15 : 20
    let actual = dayjs.tz(`${fecha} 10:00`, 'YYYY-MM-DD HH:mm', 'America/Mexico_City')

    while (actual.hour() < finHora) {
        const libre = await calendar.events.list({
            auth,
            calendarId,
            timeMin: actual.toISOString(),
            timeMax: actual.add(1, 'hour').toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
        })

        if (libre.data.items.length === 0) {
            const hora = actual.hour()
            let etiqueta = ''

            if (hora === 12) etiqueta = ' (mediodía)'
            else if (hora >= 13 && hora <= 14) etiqueta = ' (después de la comida)'
            else if (hora < 12) etiqueta = ' (por la mañana)'
            else etiqueta = ' (por la tarde)'

            const horaHumana = actual.format('h:mm A').toLowerCase()
            horariosPropuestos.push(`🕒 ${horaHumana}${etiqueta}`)
        }

        if (horariosPropuestos.length >= 5) break
        actual = actual.add(1, 'hour')
    }

    return horariosPropuestos
}

const agendarCita = async ({ nombre, fecha, hora, telefono, tratamiento }) => {
    await auth.authorize()
    const fechaInicio = dayjs.tz(`${fecha} ${hora}`, 'YYYY-MM-DD HH:mm', 'America/Mexico_City')
    const fechaFin = fechaInicio.add(1, 'hour')

    const evento = {
        summary: `Cita: ${nombre}`,
        description: `🧖 Tratamiento: ${tratamiento}\n📞 Teléfono: ${telefono}\n📅 Fecha: ${fecha} ${hora}\nAgendada vía bot WhatsApp`,
        start: {
            dateTime: fechaInicio.format(),
            timeZone: 'America/Mexico_City'
        },
        end: {
            dateTime: fechaFin.format(),
            timeZone: 'America/Mexico_City'
        },
        reminders: {
            useDefault: true,
        }
    }

    return calendar.events.insert({
        auth,
        calendarId,
        requestBody: evento,
    })
}

module.exports = {
    agendarCita,
    verificarDisponibilidad,
    obtenerHorariosDisponibles
}
