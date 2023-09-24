import kleur from "kleur";


interface ICliTableColumn {
    field: string;
    name: string;

}

interface ICliTableColumnFull extends ICliTableColumn {
    width: number;
}

interface ICliTableOptions {
    intersectionCharacter: string;
    columns: ICliTableColumn[];
    leftPad: number;
}

interface ICliTableRow {

}

const cliTable = (data: ICliTableRow[], options?: Partial<ICliTableOptions>) => {
    const intersection_character = options?.intersectionCharacter ?? '+';

    const columns_map: Map<string, ICliTableColumn> = options?.columns ?
        new Map(options.columns.map(column => [column.name, column])) :
        data.reduce<Map<string, ICliTableColumn>>(
            (columns_map, row) => {
                Object.keys(row).forEach((key) => {
                    if (!columns_map.has(key)) {
                        columns_map.set(key, {field: key, name: key})
                    }
                })
                return columns_map;
            },
            new Map())

    const columns: ICliTableColumnFull[] = Array.from(columns_map.values()).map((column) => ({
        ...column,
        name: kleur.bold(column.name),
        width: column.name.length
    }));

    /** Отступ */
    const pad = (text: string, length: number) =>
        (
            "" +
            text +
            new Array(Math.max(length - ("" + text).length + 1, 0)).join(" ")
        );

    data.forEach(e =>
        columns.forEach(column => {
            if (typeof e[column.field] === "undefined" || !column.width) {
                return;
            }

            column.width = Math.max(column.width, ("" + e[column.field]).length);
        })
    );

    const output: string[] = [];

    const separator = [""]
        .concat(columns.map(e => new Array(e.width + 1).join("-")))
        .concat([""])
        .join("-" + intersection_character + "-");

    output.push(separator);
    output.push(
        [""]
            .concat(columns.map(e => pad(e.name, e.width)))
            .concat([""])
            .join(" | ")
    );
    output.push(separator);
    data.forEach(row => {
        output.push(
            [""]
                .concat(columns.map(column => pad(row[column.field], column.width)))
                .concat([""])
                .join(" | ")
        );
    });
    output.push(separator);

    const left_pad = " ".repeat(options?.leftPad ?? 0) || "";

    return (
        left_pad +
        output.map(e => e.replace(/^[ -]/, "").replace(/[ -]$/, "")).join("\n" + left_pad)
    );
};

export default cliTable;
