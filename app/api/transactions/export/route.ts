import { connectToDatabase } from "@/lib/db";
import { getAuthedUser } from "@/lib/server";
import Transaction from "@/models/Transaction";

function escapeCsv(value: string | number) {
  const text = String(value ?? "");
  return `"${text.replaceAll("\"", "\"\"")}"`;
}

export async function GET() {
  const { userId, response } = await getAuthedUser();
  if (response) return response;

  await connectToDatabase();
  const items = await Transaction.find({ userId }).sort({ date: -1 }).lean();

  const header = ["date", "type", "category", "note", "amount"].join(",");
  const rows = items.map((item) =>
    [
      new Date(item.date).toISOString().slice(0, 10),
      escapeCsv(item.type),
      escapeCsv(item.category),
      escapeCsv(item.note),
      item.amount,
    ].join(",")
  );

  const csv = [header, ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=spendwise-transactions.csv",
    },
  });
}
