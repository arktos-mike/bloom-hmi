const locale = {
  "self": "Español",
  "footer": "© TEHMASHHOLDING Cheboksary, Rusia",
  "decimalSeparator": ",",
  "menu": {
    "close": "CERRAR",
    "overview": "DESCRIPCIÓN GENERAL",
    "settings": "CONFIGURACIÓN",
    "settingsOp": "PANEL DEL OPERADOR",
    "users": "ADMINISTRACIÓN DE USUARIOS",
    "shifts": "GESTIÓN DE TURNOS",
    "logs": "REGISTROS",
    "modelog": "REGISTRO DE INICIO Y PARADA",
    "userlog": "REGISTRO DE ACCESO",
    "machineInfo": "INFORMACIÓN DEL TELAR",
    "settingsDev": "ADQUISICIÓN DE DATOS",
    "settingsTech": "TECNOLOGÍA"
  },
  "shift": {
    "shift": "Turno",
    "days": "d",
    "hours": "h",
    "mins": "m",
    "secs": "s",
    "starttime": "Principio",
    "duration": "Duración",
    "monday": "Lun",
    "tuesday": "Mar",
    "wednesday": "Mié",
    "thursday": "Jue",
    "friday": "Vie",
    "saturday": "Sáb",
    "sunday": "Dom"
  },
  "tags": {
    "picks": {
      "descr": "Pasadas"
    },
    "comTime": {
      "eng": "ms"
    },
    "speedMainDrive": {
      "eng": "rpm"
    },
    "planSpeedMainDrive": {
      "descr": "Velocidad planificada",
      "eng": "rpm"
    },
    "planClothDensity": {
      "descr": "Densidad planificada",
      "eng": "pasadas/cm"
    },
    "planOrderLength": {
      "descr": "Longitud del pedido",
      "eng": "m"
    },
    "modeControl": {
      "descr": "Modo de ejecución",
      "0": "continuo",
      "1": "cortar pedido personalizado"
    },
    "takeupDiam": {
      "descr": "Diámetro de rodillo de recogida",
      "eng": "cm"
    },
    "takeupRatio": {
      "descr": "Transmisión de rodillo de recogida",
    },
    "mode": {
      "init": "Init",
      "stop": "Detener",
      "ready": "Afinación",
      "run": "Correr",
      "alarm": "Alarma",
      "unknown": "Desconocido"
    }
  },
  "time": {
    "date": "Fecha",
    "time": "Hora",
    "title": "Configuración de fecha/hora",
    "submit": "CAMBIAR FECHA Y HORA"
  },
  "user": {
    "anon": "Invitado",
    "fill": "Por favor complete este campo",
    "user": "Usuario",
    "admin": "Administrador",
    "login": "INICIAR SESIÓN",
    "change": "Editar usuario",
    "logout": "CERRAR SESIÓN",
    "signin": "Iniciar sesión",
    "submit": "ENVIAR",
    "curuser": "Usuario actual",
    "engineer": "Reparador",
    "password": "Contraseña",
    "remember": "Recuérdame",
    "newpassword": "Nueva contraseña",
    "oldpassword": "Contraseña antigua",
    "wrongemail": "Correo electrónico inválido",
    "id": "ID",
    "name": "Nombre de usuario",
    "email": "Correo electrónico",
    "phone": "Teléfono",
    "role": "Rol",
    "weaver": "Tejedor",
    "manager": "Gerente",
    "action": "Acción",
    "register": "Registro de nuevo usuario",
    "delete": "ELIMINAR USUARIO",
    "editsubmit": "EDITAR",
    "regsubmit": "REGISTRARSE"
  },
  "confirm": {
    "ok": "SÍ",
    "descr": "Realmente quieres hacer cambios?",
    "title": "Confirmar acción",
    "cancel": "NO"
  },
  "notifications": {
    "idle": "Cierre de sesión debido a inactividad",
    "dtupdate": "La fecha/hora cambió con éxito",
    "userok": "Inicio de sesión exitoso",
    "reboot": "Reinicio pendiente",
    "usererror": "Contraseña incorrecta",
    "rightserror": "Derechos de usuario insuficientes",
    "confupdate": "Configuración cambiada",
    "logupdate": "Registro cambiado",
    "servererror": "Error del servidor",
    "dberror": "Error de base de datos",
    "dataerror": "Datos incorrectos",
    "userexist": "El usuario ya existe",
    "userregistered": "Usuario registrado",
    "notregistered": "No se pudo registrar el usuario",
    "userdel": "Usuario eliminado",
    "userupdate": "Usuario actualizado"
  },
  "com": {
    "path": "Port path",
    "scan": "Tiempo de escaneo",
    "timeout": "Tiempo de espera",
    "baudRate": "Velocidad de transmisión",
    "dataBits": "Bits de datos",
    "stopBits": "Bit de parada",
    "parity": {
      "parity": "Paridad",
      "none": "ninguno",
      "even": "incluso",
      "mark": "siempre 1",
      "odd": "raro",
      "space": "siempre 0"
    }
  },
  "rtu": {
    "com": "Puerto COM",
    "sId": "ID de esclavo",
    "swapBytes": "swap bytes",
    "swapWords": "bytes de intercambio"
  },
  "tcp": {
    "address": "Dirección",
    "ip": "dirección IP",
    "port": "puerto"
  },
  "ip": {
    "ip": "Dirección IP",
    "mask": "Máscara de subred",
    "gw": "Puerta de enlace"
  },
  "panel": {
    "com": "Configuración del puerto COM",
    "rtu": "Configuración ModbusRTU",
    "tcp": "Configuración de ModbusTCP",
    "language": "Selección de idioma",
    "actions": "Acciones",
    "network": "Configuración de red",
    "lifetime": "Estadísticas de telar de por vida",
    "setpoints": "Puntos de ajuste planificados",
    "equipment": "Parámetros del equipo"
  },
  "log": {
    "login": "Iniciar sesión",
    "logout": "Cerrar sesión",
    "select": "Rango seleccionado:",
    "event": "Evento"
  },
  "system": {
    "reboot": "REINICIAR DISPOSITIVO"
  }
}
export default locale
