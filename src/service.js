import store from './store'

// ------------ factories
function lineFactory (data) {
  return {
    stations: [],
    code: data.code,
    name: data.name,
    directions: data.directions,
    traffic: null,
  }
}

function stationFactory (lineCode, data) {
  return {
    line: lineCode,
    slug: data.slug,
    name: data.name,
    schedules: {},
  }
}

function trafficFactory (data) {
  return {
    line: data.line,
    title: data.title,
    message: data.message,
  }
}

function scheduleFactory (data) {
  return {
    destination: data.destination,
    message: data.message,
  }
}

// ------------ API calls
const API_ROOT = 'https://api-ratp.pierre-grimaud.fr/v3'

export async function getLines () {
  const payload = await basicXhr(`${API_ROOT}/lines/metros`)
  return JSON.parse(payload).result.metros.map((line) => lineFactory(line))
}

export async function getStations (lineCode) {
  const payload = await basicXhr(`${API_ROOT}/stations/metros/${lineCode}`)
  return JSON.parse(payload).result.stations.map((station) => stationFactory(lineCode, station))
}

export async function getTraffic () {
  const payload = await basicXhr(`${API_ROOT}/traffic`)
  return JSON.parse(payload).result.metros.map((t) => trafficFactory(t))
}

export async function getSchedules (line, station) {
  const directions = ['A', 'R']
  const payloads = await Promise.all(
    directions.map((dir) => basicXhr(`${API_ROOT}/schedules/metros/${line}/${station}/${dir}`))
  )
  return payloads
    .map((payload, i) => (
      {
        direction: directions[i],
        schedules: JSON.parse(payload).result.schedules.map((s) => scheduleFactory(s)),
      }
    ))
    // put this array of two elements into an object with directions as keys
    .reduce((ret, curr) => {
      ret[curr.direction] = curr.schedules
      return ret
    }, {})
}

function basicXhr (url, {method = 'GET', data = null, headers = {}, withCredentials = false} = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, url)
    for (let key of Object.keys(headers)) {
      xhr.setRequestHeader(key, headers[key])
    }
    xhr.withCredentials = withCredentials
    xhr.onerror = reject
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) {
        return
      }
      if (xhr.status < 200 || xhr.status > 499) {
        store.commit('updateServerState', false)
        reject(xhr)
      } else {
        store.commit('updateServerState', true)
        resolve(xhr.responseText)
      }
    }
    xhr.send(data)
  })
}
