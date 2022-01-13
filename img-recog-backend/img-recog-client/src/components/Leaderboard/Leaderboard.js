import { Card } from "reactstrap";

export default function Leaderboard({ leaderboard }) {
  return (
    <Card
      className="mt4 pv2"
      style={{
        backgroundColor: "rgba(255,255,255,0.5)",
      }}
    >
      <h4 className="f5 f4-ns b mb2">Top 5 Objects Detected Globally</h4>
      <ol className="pl0" style={{ margin: "0 auto" }}>
        {leaderboard.map(({ id, entries, name }) => (
          <li key={id} className="tl" style={{ listStylePosition: "inside" }}>
            <span className="ml3">
              {entries} {`${name}${entries > 1 ? "s" : ""}`}
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
