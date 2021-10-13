export function getEventID(separator: string, args: Array<string>) : string {
  return args.join(separator)
}