const locale = {
  "self": "Русский",
  "footer": "© ТЕХМАШХОЛДИНГ г.Чебоксары",
  "decimalSeparator": ",",
  "menu": {
    "close": "ЗАКРЫТЬ",
    "overview": "ОБЗОР",
    "settings": "НАСТРОЙКИ",
    "settingsOp": "ПАНЕЛЬ ОПЕРАТОРА",
    "users": "АДМИНИСТРИРОВАНИЕ ПОЛЬЗОВАТЕЛЕЙ",
    "shifts": "УПРАВЛЕНИЕ СМЕНАМИ",
    "settingsDev": "СБОР ДАННЫХ",
    "settingsTech": "ТЕХНОЛОГИЯ"
  },
  "shift": {
    "shift": "Смена",
    "days" : "д",
    "hours" : "ч",
    "mins" : "м",
    "secs" : "c",
    "starttime" : "Начало",
    "duration" : "Продолжительность",
    "monday" : "Пн",
    "tuesday" : "Вт",
    "wednesday" : "Ср",
    "thursday" : "Чт",
    "friday" : "Пт",
    "saturday" : "Сб",
    "sunday" : "Вс"
  },
  "tags": {
    "comTime": {
      "eng": "мс"
    },
    "speedMainDrive": {
      "eng": "об/мин"
    },
    "planSpeedMainDrive": {
      "descr": "Плановая скорость",
      "eng": "об/мин"
    },
    "planClothDensity": {
      "descr": "Плановая плотность",
      "eng": "ут/см"
    },
    "takeupDiam": {
      "descr": "Диаметр вальяна",
      "eng": "см"
    },
    "takeupRatio": {
      "descr": "Передаточное число вальяна",
    },
    "mode": {
      "init": "Инициализация",
      "stop": "Стоп",
      "ready": "Наладка",
      "run": "Работа",
      "alarm": "Авария",
      "unknown": "Неизвестно"
    }
  },
  "time": {
    "date": "Дата",
    "time": "Время",
    "title": "Настройка даты и времени",
    "submit": "ИЗМЕНИТЬ ДАТУ И ВРЕМЯ"
  },
  "user": {
    "anon": "Гость",
    "fill": "Пожалуйста, заполните поле",
    "user": "Пользователь",
    "admin": "Администратор",
    "login": "ВОЙТИ В СИСТЕМУ",
    "change": "Изменить пользователя",
    "logout": "ВЫЙТИ ИЗ СИСТЕМЫ",
    "signin": "Вход в систему",
    "submit": "ПРИМЕНИТЬ",
    "curuser": "Текущий пользователь",
    "fixer": "Наладчик",
    "password": "Пароль",
    "remember": "Не выходить из системы",
    "newpassword": "Новый пароль",
    "oldpassword": "Старый пароль",
    "wrongemail": "Неверный email",
    "id": "Код",
    "name": "Имя пользователя",
    "email": "Эл.почта",
    "phone": "Телефон",
    "role": "Роль",
    "weaver": "Ткач",
    "manager": "Организатор",
    "action": "Действие",
    "register": "Регистрация нового пользователя",
    "delete": "УДАЛИТЬ ПОЛЬЗОВАТЕЛЯ",
    "editsubmit": "ИЗМЕНИТЬ",
    "regsubmit": "ЗАРЕГИСТРИРОВАТЬ"
  },
  "confirm": {
    "ok": "ДА",
    "descr": "Вы действительно хотите внести изменения?",
    "title": "Подтверждение действия",
    "cancel": "НЕТ"
  },
  "notifications": {
    "idle": "Выход из системы из-за бездействия",
    "dtupdate": "Дата/время успешно изменены",
    "userok": "Успешный вход",
    "reboot": "Ожидается перезагрузка",
    "usererror": "Неверный пароль",
    "rightserror": "Недостаточно прав пользователя",
    "confupdate": "Настройки изменены",
    "servererror": "Ошибка сервера",
    "dberror": "Ошибка базы данных",
    "dataerror": "Некорректные данные",
    "userexist": "Пользователь уже существует",
    "userregistered": "Пользователь зарегистрирован",
    "notregistered": "Не удалось зарегистрировать пользователя",
    "userdel": "Пользователь удален",
    "userupdate": "Пользователь обновлен"
  },
  "com": {
    "path": "Путь к порту",
    "scan": "Период опроса",
    "timeout": "Таймаут",
    "baudRate": "Скорость передачи",
    "dataBits": "Число бит данных",
    "stopBits": "Стоп бит",
    "parity": {
      "parity": "Контроль четности",
      "none": "отсутствует",
      "even": "четный",
      "mark": "всегда в 1",
      "odd": "нечетный",
      "space": "всегда в 0"
    }
  },
  "rtu": {
    "com": "COM-порт",
    "sId": "Адрес ведомого",
    "swapBytes": "перевернуть байты",
    "swapWords": "перевернуть слова"
  },
  "tcp": {
    "address": "Адрес",
    "ip": "IP-адрес",
    "port": "порт"
  },
  "ip": {
    "ip": "IP-адрес",
    "mask": "Маска подсети",
    "gw": "Шлюз"
  },
  "panel": {
    "com": "Настройки COM-порта",
    "rtu": "Настройки ModbusRTU",
    "tcp": "Настройки ModbusTCP",
    "language": "Выбор языка",
    "actions": "Действия",
    "network": "Сетевые настройки",
    "setpoints": "Плановые уставки",
    "equipment": "Параметры оборудования"
  },
  "system": {
    "reboot": "ПЕРЕЗАГРУЗКА ПАНЕЛИ"
  }
}
export default locale
