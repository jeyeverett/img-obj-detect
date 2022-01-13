import { Card } from "reactstrap";

export default function Leaderboard() {
  return (
    <Card
      className="mt4 pt2"
      style={{
        backgroundColor: "rgba(255,255,255,0.5)",
      }}
    >
      <h4 className="f5 f4-ns b mb2">Top Objects Detected Globally</h4>
      <ol>
        <li>Potato</li>
        <li>Poop</li>
        <li>Salad</li>
      </ol>
    </Card>
  );
}
