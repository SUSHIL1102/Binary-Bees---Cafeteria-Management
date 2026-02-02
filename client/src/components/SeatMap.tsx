import { useMemo } from "react";

const TABLES_X = 5;
const TABLES_Y = 5;
const SEATS_PER_TABLE = 4;
const TOTAL_SEATS = TABLES_X * TABLES_Y * SEATS_PER_TABLE;

/** 6x5 grid: 25 reservable tables + 5 dummy cafeteria spots */
const LAYOUT_COLS = 6;
const LAYOUT_ROWS = 5;

type SeatStatus = "available" | "taken" | "selected";
type DummyKind = Extract<LayoutCell, { type: "dummy" }>["kind"];

type LayoutCell =
  | { type: "table"; tableIndex: number }
  | { type: "dummy"; label: string; kind: "coffee" | "salad" | "condiments" | "trash" | "utensils" };

const LAYOUT: LayoutCell[][] = (() => {
  const grid: LayoutCell[][] = [];
  let tableIndex = 0;
  const dummies: { r: number; c: number; label: string; kind: DummyKind; }[] = [
    { r: 0, c: 2, label: "Coffee & drinks", kind: "coffee" },
    { r: 1, c: 5, label: "Salad bar", kind: "salad" },
    { r: 2, c: 1, label: "Condiments", kind: "condiments" },
    { r: 3, c: 3, label: "Trash & trays", kind: "trash" },
    { r: 4, c: 0, label: "Utensils", kind: "utensils" },
  ];
  for (let r = 0; r < LAYOUT_ROWS; r++) {
    grid[r] = [];
    for (let c = 0; c < LAYOUT_COLS; c++) {
      const d = dummies.find((d) => d.r === r && d.c === c);
      if (d) grid[r].push({ type: "dummy", label: d.label, kind: d.kind });
      else {
        grid[r].push({ type: "table", tableIndex: tableIndex++ });
      }
    }
  }
  return grid;
})();

type Props = {
  takenSeatNumbers: number[];
  selectedSeatNumbers: number[];
  onToggleSeat: (seatNumber: number) => void;
  maxSelection: number;
};

function getStatus(
  seatNumber: number,
  taken: number[],
  selected: number[]
): SeatStatus {
  if (taken.includes(seatNumber)) return "taken";
  if (selected.includes(seatNumber)) return "selected";
  return "available";
}

export default function SeatMap({
  takenSeatNumbers,
  selectedSeatNumbers,
  onToggleSeat,
  maxSelection,
}: Props) {
  const tables = useMemo(() => {
    const out: { tableIndex: number; seats: number[] }[] = [];
    for (let t = 0; t < TABLES_X * TABLES_Y; t++) {
      out.push({
        tableIndex: t,
        seats: [t * SEATS_PER_TABLE + 1, t * SEATS_PER_TABLE + 2, t * SEATS_PER_TABLE + 3, t * SEATS_PER_TABLE + 4],
      });
    }
    return out;
  }, []);

  const handleClick = (seatNumber: number) => {
    if (takenSeatNumbers.includes(seatNumber)) return;
    const isSelected = selectedSeatNumbers.includes(seatNumber);
    if (isSelected) {
      onToggleSeat(seatNumber);
      return;
    }
    if (selectedSeatNumbers.length >= maxSelection) return;
    onToggleSeat(seatNumber);
  };

  return (
    <div className="seat-map">
      <div className="seat-map__stage">Counter / Serving area</div>
      <div
        className="seat-map__tables"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${LAYOUT_COLS}, 1fr)`,
          gap: "12px",
          maxWidth: "min(520px, 100%)",
          margin: "0 auto",
        }}
      >
        {LAYOUT.flatMap((row, r) =>
          row.map((cell, c) => {
            if (cell.type === "dummy") {
              return (
                <div
                  key={`dummy-${r}-${c}`}
                  className={`seat-map__dummy seat-map__dummy--${cell.kind}`}
                  title={cell.label}
                >
                  <span className="seat-map__dummy-label">{cell.label}</span>
                </div>
              );
            }
            const { tableIndex, seats } = tables[cell.tableIndex];
            return (
              <div key={tableIndex} className="seat-map__table">
                <div className="seat-map__table-surface" aria-hidden />
                <div className="seat-map__table-seats">
                  {seats.map((seatNumber) => {
                    const status = getStatus(seatNumber, takenSeatNumbers, selectedSeatNumbers);
                    return (
                      <div
                        key={seatNumber}
                        className={`seat-map__seat seat-map__seat--${status}`}
                        onClick={() => handleClick(seatNumber)}
                        title={`Seat ${seatNumber}${status === "taken" ? " (taken)" : status === "selected" ? " (selected)" : ""}`}
                      >
                        <span className="seat-map__seat-num">{seatNumber}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="seat-map__legend">
        <span className="seat-map__legend-item seat-map__legend-item--available">Available</span>
        <span className="seat-map__legend-item seat-map__legend-item--selected">Your selection</span>
        <span className="seat-map__legend-item seat-map__legend-item--taken">Taken</span>
      </div>
    </div>
  );
}
