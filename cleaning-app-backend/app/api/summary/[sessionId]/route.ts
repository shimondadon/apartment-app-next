import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { workSessionsStorage, workersStorage } from "@/lib/storage";

export async function GET(request, { params }) {
  const auth = authenticateRequest(request);
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const session = workSessionsStorage.findById(params.sessionId);
  if (!session) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  const worker = workersStorage.findById(session.workerId);
  const apartment = { id: session.apartmentId, name: `דירה ${session.apartmentId}`, icon: "" };
  let duration = 0;
  if (session.startTime && session.endTime) {
    duration = Math.floor((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000);
  }
  return NextResponse.json({ 
    success: true, 
    data: { workSessionId: session.id, worker, apartment, startTime: session.startTime, endTime: session.endTime, duration, tasksCompleted: 0, totalTasks: 30, inventoryUsed: [], issuesReported: [] }
  });
}
