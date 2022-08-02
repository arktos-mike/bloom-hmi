import * as dotenv from 'dotenv'
dotenv.config()
import cors from 'cors'
import express from 'express'
import mountRoutes from './routes'
import db from '../db'
import * as bcrypt from 'bcrypt';
import createTableText from './createdb'
import { networkInterfaces } from 'os'
import { SerialPort } from 'serialport'
import ModbusRTU from 'modbus-serial'
const client1 = new ModbusRTU();
const client2 = new ModbusRTU();

const api = express()
api.use(express.json())
api.use(express.urlencoded({ extended: true }))
api.use(cors())
mountRoutes(api)
api.post('/writeTagRTU', async (req, res) => {
  const { name, value } = req.body;
  writeTag.name = name;
  writeTag.val = value;
  writeTrig = true;
  res.status(201).send({
    message: "Writing data to RTU",
    body: { writeTag },
  })
})

api.listen(process.env['EXPRESS_SERVER_PORT'] || 3000, () => {
  console.log(`API Server listening on port `, process.env['EXPRESS_SERVER_PORT'] || 3000)
})


let mbsStatus = "Initializing...";    // holds a status of Modbus
// Modbus 'state' constants
const MBS_STATE_STEADY = "State steady";
const MBS_STATE_INIT = "State init";
const MBS_STATE_IDLE = "State idle";
const MBS_STATE_NEXT = "State next";
const MBS_STATE_GOOD_READ = "State good (read)";
const MBS_STATE_FAIL_READ = "State fail (read)";
const MBS_STATE_GOOD_CONNECT = "State good (port)";
const MBS_STATE_FAIL_CONNECT = "State fail (port)";
const MBS_STATE_GOOD_WRITE = "State good (write)";
const MBS_STATE_FAIL_WRITE = "State fail (write)";


// Modbus configuration values
let com1 = { path: '', conf: {}, scan: 0, timeout: 0, mbsState: MBS_STATE_STEADY, slaves: Array() };
let com2 = { path: '', conf: {}, scan: 0, timeout: 0, mbsState: MBS_STATE_STEADY, slaves: Array() };

//const arrayToObject = (arr, keyField) =>
//  Object.assign({}, ...arr.map(item => ({ [item[keyField]]: item })))

const dbInit = async () => {
  // create table
  await db.query(createTableText)
  const nets:any = networkInterfaces();
  const netResults = {};
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        if (!netResults[name]) {
          netResults[name] = [];
        }
        netResults[name].push(net);
      }
    }
  }
  let opIP
  switch (process.platform) {
    case 'linux':
      if (netResults['eth0'] && netResults['eth0'][0]) opIP = netResults['eth0'][0]
      else if (netResults['wlan0'] && netResults['wlan0'][0]) opIP = netResults['wlan0'][0]
      break;
    case 'win32':
      if (netResults['Ethernet'] && netResults['Ethernet'][0]) opIP = netResults['Ethernet'][0]
      else if (netResults[0] && netResults[0][0]) opIP = netResults[0][0]
      break;
  }
  const ipConf = { opIP: opIP, plcIP1: "192.168.1.6", plcIP2: "192.168.1.7" }
  await SerialPort.list().then(async function (ports) {
    if (ports[0] !== undefined) { com1.path = ports[0].path; } //else { com1.path = "COM3"; }
    if (ports[1] !== undefined) { com2.path = ports[1].path; } //else { com2.path = "COM3"; }
    const comConf = { opCOM1: { path: com1.path, conf: { baudRate: 115200, parity: "none", dataBits: 8, stopBits: 1 }, scan: 1000, timeout: 0 }, opCOM2: { path: "COM3", conf: { baudRate: 115200, parity: "none", dataBits: 8, stopBits: 1 }, scan: 1000, timeout: 0 } }
    const rtuConf = { rtu1: { com: 'opCOM2', sId: 1, swapBytes: true, swapWords: true }, rtu2: { com: 'opCOM2', sId: 2, swapBytes: true, swapWords: true } }
    const tags = [
      { name: "picksLastRun", group: "monitoring", dev: "rtu1", addr: "0", type: "dword", reg: "r", min: 0, max: 4294967295, dec: 0 },
      { name: "speedMainDrive", group: "monitoring", dev: "rtu1", addr: "2", type: "float", reg: "r", min: 0, max: 600, dec: 1 },
      { name: "clothDensity", group: "monitoring", dev: "rtu1", addr: "4", type: "float", reg: "r", min: 0.5, max: 25, dec: 2 },
      { name: "speedCloth", group: "monitoring", dev: "rtu1", addr: "6", type: "float", reg: "r", min: 1, max: 5, dec: 1 },
      { name: "modeCode", group: "monitoring", dev: "rtu1", addr: "8", type: "word", reg: "r", min: 0, max: 3, dec: 0 },
      { name: "takeupRatio", group: "setting", dev: "rtu1", addr: "9", type: "word", reg: "rw", min: 1, max: 65535, dec: 0 },
      { name: "takeupDiam", group: "setting", dev: "rtu1", addr: "10", type: "float", reg: "rw", min: 1, max: 20, dec: 1 },
      { name: "modeControl", group: "setting", dev: "rtu1", addr: "12", type: "word", reg: "rw", min: 0, max: 2, dec: 0 },
      { name: "stopAngle", group: "visual", dev: "rtu1", addr: "13", type: "word", reg: "r", min: 0, max: 359, dec: 0 },
    ]
    const locales = [
      { self: "English", menu: { overview: "OVERVIEW", settings: "SETTINGS", system: "CONNECTIONS", alarms: "ALARMS" }, notifications: { idle: "User inactive" }, footer: "© TEHMASHHOLDING Cheboksary, Russia" },
      { self: "Español", menu: { overview: "GENERAL", settings: "CONFIGURACIÓN", system: "CONEXIONES", alarms: "ALARMAS" }, notifications: { idle: "Usuario inactivo" }, footer: "© TEHMASHHOLDING Cheboksary, Rusia" },
      { self: "Русский", menu: { overview: "ОБЗОР", settings: "НАСТРОЙКИ", system: "СОЕДИНЕНИЯ", alarms: "АВАРИИ" }, notifications: { idle: "Пользователь неактивен" }, footer: "© ТЕХМАШХОЛДИНГ г.Чебоксары" },
      { self: "Türkçe", menu: { overview: "GENEL", settings: "AYARLAR", system: "BAĞLANTILAR", alarms: "ALARMLAR" }, notifications: { idle: "Kullanıcı etkin değil" }, footer: "© TEHMASHHOLDİNG Cheboksary, Rusya Federasyonu" },
    ]
    await db.query('INSERT INTO hwconfig VALUES($1,$2) ON CONFLICT (name) DO NOTHING;', ['ipConf', ipConf])
    await db.query('INSERT INTO hwconfig VALUES($1,$2) ON CONFLICT (name) DO NOTHING;', ['comConf', comConf])
    await db.query('INSERT INTO hwconfig VALUES($1,$2) ON CONFLICT (name) DO NOTHING;', ['rtuConf', rtuConf])
    await db.query('INSERT INTO tags SELECT * FROM UNNEST($1::jsonb[]) ON CONFLICT (tag) DO NOTHING;', [tags])
    bcrypt.hash('123456', 10, async (err, hash) => {
      await db.query(`INSERT INTO users (id, name, password, role) VALUES(1,'Admin',$1,'sa') ON CONFLICT (id) DO NOTHING;`, [hash])
    });
    await db.query('INSERT INTO locales SELECT UNNEST($1::text[]), UNNEST($2::jsonb[]), UNNEST($3::boolean[]) ON CONFLICT (locale) DO NOTHING;', [['en', 'es', 'ru', 'tr'], locales, [false, false, true, false]])

    const comRows = await db.query('SELECT * FROM hwconfig WHERE name = $1', ['comConf']);
    com1 = Object.assign(com1, comRows.rows[0].data.opCOM1, { act: 0 });
    com2 = Object.assign(com2, comRows.rows[0].data.opCOM2, { act: 0 });
    const rtuRows = await db.query('SELECT * FROM hwconfig WHERE name = $1', ['rtuConf']);
    for (let prop in rtuRows.rows[0].data) {
      switch (rtuRows.rows[0].data[prop].com) {
        case "opCOM1":
          //const com1t = await db.query('SELECT tag->$5 as name, tag->$6 as addr, tag->$7 as type, tag->$8 as reg FROM tags WHERE tag->>$1=$2 AND tag->>$3=$4', ['dev', prop, 'group', 'monitoring', 'name', 'addr', 'type', 'reg']);
          const com1t = await db.query('SELECT tag->$3 as name, tag->$4 as addr, tag->$5 as type, tag->$6 as reg FROM tags WHERE tag->>$1=$2', ['dev', prop, 'name', 'addr', 'type', 'reg']);
          com1.slaves.push(Object.assign({ name: prop }, rtuRows.rows[0].data[prop], { tags: com1t.rows }));
          break;
        case "opCOM2":
          //const com2t = await db.query('SELECT tag->$5 as name, tag->$6 as addr, tag->$7 as type, tag->$8 as reg FROM tags WHERE tag->>$1=$2 AND tag->>$3=$4', ['dev', prop, 'group', 'monitoring', 'name', 'addr', 'type', 'reg']);
          const com2t = await db.query('SELECT tag->$3 as name, tag->$4 as addr, tag->$5 as type, tag->$6 as reg FROM tags WHERE tag->>$1=$2', ['dev', prop, 'name', 'addr', 'type', 'reg']);
          com2.slaves.push(Object.assign({ name: prop }, rtuRows.rows[0].data[prop], { tags: com2t.rows }));
          break;
        default:
        // nothing to do
      }
    }
    com1.mbsState = MBS_STATE_INIT;
    com2.mbsState = MBS_STATE_INIT;
    if (com1.slaves.length > 0) { runModbus(client1, com1) }
    if (com2.slaves.length > 0) { runModbus(client2, com2) }
  });
}
dbInit();

//==============================================================
const connectClient = async function (client, port) {
  // set requests parameters
  await client.setTimeout(port.timeout);
  // try to connect
  try {
    await client.connectRTUBuffered(port.path, port.conf)
    port.mbsState = MBS_STATE_GOOD_CONNECT;
    mbsStatus = "[" + port.path + "]" + "Connected, wait for reading...";
    console.log(mbsStatus);
  } catch (e) {
    port.mbsState = MBS_STATE_FAIL_CONNECT;
    mbsStatus = "[" + port.path + "]" + e.message;
    console.log(mbsStatus);
  }
}

//==============================================================
function getByteLength(type) {
  switch (String(type).toLowerCase()) {
    case "int16":
    case "word":
      return 2;
    case "int32":
    case "dword":
    case "float":
      return 4;
    default:
      throw new Error("Unsupported type");
  }
}

let writeTrig = false;
let writeTag = { name: '', val: 0 };
const writeModbusData = async function (tagName, val) {
  await process(tagName, val)
  writeTrig = false;
  async function process(tagName, val) {
    const tagRow = await db.query('select tag->$1 as dev, tag->$2 as addr, tag->$3 as type, tag->$4 as reg FROM tags WHERE tag->>$5=$6', ['dev', 'addr', 'type', 'reg', 'name', tagName]);
    let tag = tagRow.rows[0];
    tag.name = tagName;
    const slaveRow = await db.query('SELECT data->$1 as rtu FROM hwconfig WHERE name=$2 AND data?$1', [tagRow.rows[0].dev, 'rtuConf']);
    let slave = slaveRow.rows[0].rtu;
    let client
    let port
    switch (slave.com) {
      case "opCOM1":
        client = client1;
        port = com1;
        break;
      case "opCOM2":
        client = client2;
        port = com2;
        break;
      default:
      // nothing to do
    }
    await client.setID(slave.sId);
    switch (tag.type) {
      case 'bool':
        try {
          await client.writeCoils(tag.addr, val);
          port.mbsState = MBS_STATE_GOOD_WRITE;
          mbsStatus = "success";
          //console.log("[" + port.path + "]" + "[#" + slave.sId + "]" + tag.name + " = " + val);
        } catch (e) {
          port.mbsState = MBS_STATE_FAIL_WRITE;
          mbsStatus = "[" + port.path + "]" + "[#" + slave.sId + "]" + tag.name + " " + e.message;
          console.log(mbsStatus);
        }
        break;
      default:
        try {
          const size = getByteLength(tag.type);
          const buffer = Buffer.allocUnsafe(size);
          val = Number(val.replace(',', '.'))
          if (tag.type === "int16") {
            slave.swapWords ? buffer.writeInt16LE(val) : buffer.writeInt16BE(val);
          } else if (tag.type === "word") {
            slave.swapWords ? buffer.writeUInt16LE(val) : buffer.writeUInt16BE(val);
          } else if (tag.type === "int32") {
            slave.swapWords ? buffer.writeInt32LE(val) : buffer.writeInt32BE(val);
          } else if (tag.type === "dword") {
            slave.swapWords ? buffer.writeUInt32LE(val) : buffer.writeUInt32BE(val);
          } else if (tag.type === "float") {
            slave.swapWords ? buffer.writeFloatLE(val) : buffer.writeFloatBE(val);
          }
          if (slave.swapBytes) { buffer.swap16(); }
          await client.writeRegisters(tag.addr, buffer);
          port.mbsState = MBS_STATE_GOOD_WRITE;
          mbsStatus = "success";
          //console.log("[" + port.path + "]" + "[#" + slave.sId + "][WRITE]" + tag.name + " = " + val);
        } catch (e) {
          port.mbsState = MBS_STATE_FAIL_WRITE;
          mbsStatus = "[" + port.path + "]" + "[#" + slave.sId + "]" + tag.name + " " + e.message;
          console.log(mbsStatus);
        }
        break;
    }
  }
};
const readModbusData = async function (client, port, slave) {
  await client.setID(slave.sId);
  let count = slave.tags.length;
  await process(slave.tags[count - 1])
  async function process(tag) {
    switch (tag.reg) {
      case 'rw':
        switch (tag.type) {
          case 'bool':
            try {
              const data = await client.readCoils(tag.addr, 1);
              port.mbsState = MBS_STATE_GOOD_READ;
              mbsStatus = "success";
              let val = data.buffer[0];
              db.query('UPDATE tags SET val=$1, updated=current_timestamp where tag->>$2=$3 and tag->>$4=$5', [val, 'dev', slave.name, 'name', tag.name]);
              //console.log("[" + port.path + "]" + "[#" + slave.sId + "]" + tag.name + " = " + val);
              if (count > 1) { count--; await process(slave.tags[count - 1]); }
            } catch (e) {
              port.mbsState = MBS_STATE_FAIL_READ;
              mbsStatus = "[" + port.path + "]" + "[#" + slave.sId + "]" + tag.name + " " + e.message;
              console.log(mbsStatus);
              if (count > 1) { count--; await process(slave.tags[count - 1]); }
            }
            break;
          default:
            try {
              const data = await client.readHoldingRegisters(tag.addr, getByteLength(tag.type) / 2)
              port.mbsState = MBS_STATE_GOOD_READ;
              mbsStatus = "success";
              if (slave.swapBytes) { data.buffer.swap16(); }
              let val;
              switch (tag.type) {
                case 'dword':
                  val = slave.swapWords ? data.buffer.readUInt32LE(0) : data.buffer.readUInt32BE(0);
                  break;
                case 'word':
                  val = slave.swapWords ? data.buffer.readUInt16LE(0) : data.buffer.readUInt16BE(0);
                  break;
                case 'float':
                  val = slave.swapWords ? data.buffer.readFloatLE(0) : data.buffer.readFloatBE(0);
                  break;
                default:
                  break;
              }
              db.query('UPDATE tags SET val=$1, updated=current_timestamp where tag->>$2=$3 and tag->>$4=$5', [val, 'dev', slave.name, 'name', tag.name]);
              //console.log("[" + port.path + "]" + "[#" + slave.sId + "]" + tag.name + " = " + val);
              if (count > 1) { count--; await process(slave.tags[count - 1]); }
            } catch (e) {
              port.mbsState = MBS_STATE_FAIL_READ;
              mbsStatus = "[" + port.path + "]" + "[#" + slave.sId + "]" + tag.name + " " + e.message;
              console.log(mbsStatus);
              if (count > 1) { count--; await process(slave.tags[count - 1]); }
            }
            break;
        }
        break;
      case 'r':
        switch (tag.type) {
          case 'bool':
            try {
              const data = await client.readDiscreteInputs(tag.addr, 1);
              port.mbsState = MBS_STATE_GOOD_READ;
              mbsStatus = "success";
              let val = data.buffer[0];
              db.query('UPDATE tags SET val=$1, updated=current_timestamp where tag->>$2=$3 and tag->>$4=$5', [val, 'dev', slave.name, 'name', tag.name]);
              //console.log("[" + port.path + "]" + "[#" + slave.sId + "]" + tag.name + " = " + val);
              if (count > 1) { count--; await process(slave.tags[count - 1]); }
            } catch (e) {
              port.mbsState = MBS_STATE_FAIL_READ;
              mbsStatus = "[" + port.path + "]" + "[#" + slave.sId + "]" + tag.name + " " + e.message;
              console.log(mbsStatus);
              if (count > 1) { count--; await process(slave.tags[count - 1]); }
            }
            break;
          default:
            try {
              const data = await client.readInputRegisters(tag.addr, getByteLength(tag.type) / 2)
              port.mbsState = MBS_STATE_GOOD_READ;
              mbsStatus = "success";
              if (slave.swapBytes) { data.buffer.swap16(); }
              let val;
              switch (tag.type) {
                case 'dword':
                  val = slave.swapWords ? data.buffer.readUInt32LE(0) : data.buffer.readUInt32BE(0);
                  break;
                case 'word':
                  val = slave.swapWords ? data.buffer.readUInt16LE(0) : data.buffer.readUInt16BE(0);
                  break;
                case 'float':
                  val = slave.swapWords ? data.buffer.readFloatLE(0) : data.buffer.readFloatBE(0);
                  break;
                default:
                  break;
              }
              db.query('UPDATE tags SET val=$1, updated=current_timestamp where tag->>$2=$3 and tag->>$4=$5', [val, 'dev', slave.name, 'name', tag.name]);
              //console.log("[" + port.path + "]" + "[#" + slave.sId + "]" + tag.name + " = " + val);
              if (count > 1) { count--; await process(slave.tags[count - 1]); }
            } catch (e) {
              port.mbsState = MBS_STATE_FAIL_READ;
              mbsStatus = "[" + port.path + "]" + "[#" + slave.sId + "]" + tag.name + " " + e.message;
              console.log(mbsStatus);
              if (count > 1) { count--; await process(slave.tags[count - 1]); }
            }
            break;
        }
        break;
      default:
        break;
    }
  }
};
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
//==============================================================
const runModbus = async function (client, port) {
  let nextAction;
  let slave = port.slaves[port.act];
  if (slave.tags.length > 0) {
    switch (port.mbsState) {
      case MBS_STATE_INIT:
        nextAction = await connectClient(client, port);
        break;

      case MBS_STATE_NEXT:
        nextAction = await readModbusData(client, port, slave);
        break;

      case MBS_STATE_GOOD_CONNECT:
        nextAction = writeTrig ? await writeModbusData(writeTag.name, writeTag.val) : await readModbusData(client, port, slave);
        break;

      case MBS_STATE_FAIL_CONNECT:
        nextAction = connectClient(client, port);
        break;
      case MBS_STATE_GOOD_WRITE:
      case MBS_STATE_GOOD_READ:
        nextAction = writeTrig ? await writeModbusData(writeTag.name, writeTag.val) : await readModbusData(client, port, slave);
        break;

      case MBS_STATE_FAIL_READ:
      case MBS_STATE_FAIL_WRITE:
        if (client.isOpen) { port.mbsState = MBS_STATE_NEXT; nextAction = writeTrig ? await writeModbusData(writeTag.name, writeTag.val) : await readModbusData(client, port, slave); }
        else { nextAction = await connectClient(client, port); }
        break;

      default:
      // nothing to do, keep scanning until actionable case
    }
    // execute "next action" function if defined
    if (nextAction !== undefined) {
      //console.log("[" + port.path + "]" + nextAction);
      await nextAction();
      port.mbsState = MBS_STATE_IDLE;
    }
  }
  port.act++;
  if (port.act === port.slaves.length) {
    port.act = 0;
  }
  await delay(port.scan);
  runModbus(client, port);
};
