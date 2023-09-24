import {EStreamStatus, IStream, UpdateStreamsInfo} from "./types";
import kleur from "kleur";
import cliTable from "./helpers/cli-table";

export const delay = (time: number = 1000) => new Promise((r) => setTimeout(r, time))

export function setIntervalImmediately<TArgs extends never[]>(callback: (...args: TArgs) => void, ms?: number, ...args: TArgs): NodeJS.Timeout {
  callback(...args);
  return setInterval(() => callback(...args), ms);
}

export const colorfullStreamStatus = (streamStatus: EStreamStatus) => streamStatus === EStreamStatus.ONLINE ? kleur.green(streamStatus) : kleur.red(streamStatus);

export const printStreamsInfo = (streams: IStream[]) => {
  const options = {
    columns: [
      { field: "index", name: kleur.white("ID") },
      { field: "streamer", name: kleur.cyan("Streamer") },
      { field: "status", name: kleur.magenta("Status") }
    ]
  };
  const data = streams.map(((stream, index) => ({ index: index + 1, streamer: stream.name, status: `${colorfullStreamStatus(stream.streamStatus)}` })));
  const table = cliTable(data,  options);
  console.log(table);
}

export const printStreamsUpdateInfo = (info: UpdateStreamsInfo) => {
  const options = {
    columns: [
      { field: "id", name: kleur.white("ID") },
      { field: "stream", name: kleur.cyan("Stream") },
      { field: "status", name: kleur.magenta("Update") }
    ]
  };
  const data = info.addedStreams
      .map((s, index) => ({ id: index + 1, stream: s.name, status: 'started' }))
      .concat(info.removedStreams.map((s, index) => ({ id: index + 1, stream: s.name, status: 'closed' })))
  const table = cliTable(data, options);
  console.log(table);
}
