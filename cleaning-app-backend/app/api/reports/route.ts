import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import {
  workSessionsStorage,
  workersStorage,
  inventoryLogsStorage,
  issuesStorage,
  taskCompletionsStorage,
} from '@/lib/storage';
import { WorkSession, Worker, Apartment, WorkSummary, ApiResponse, TaskWithStatus, TaskCompletion } from '@/lib/types';

// Apartment data (in a real app, this would come from a database)
const APARTMENTS: Apartment[] = [
  { id: 1, name: 'דירה 101', icon: '🏠' },
  { id: 2, name: 'דירה 102', icon: '🏠' },
  { id: 3, name: 'דירה 103', icon: '🏠' },
  { id: 4, name: 'דירה 104', icon: '🏠' },
  { id: 5, name: 'דירה 201', icon: '🏢' },
  { id: 6, name: 'דירה 202', icon: '🏢' },
];

// Task categories - must match tasks/route.ts
const TASK_CATEGORIES = [
  {
    name: '1. סריקה ראשונית',
    tasks: [
      { id: 'initial_1', text: 'בדיקת נזקים חריגים או פריטים חסרים', hasInventory: false },
      { id: 'initial_2', text: 'בדיקת חפצים אישיים שנשכחו', hasInventory: false },
      { id: 'initial_3', text: 'ריקון כל הפחים ושטיפתם', hasInventory: false },
      { id: 'initial_4', text: 'פתיחת חלונות לאוורור', hasInventory: false },
    ],
  },
  {
    name: '2. מטבח ופינת אוכל',
    tasks: [
      { id: 'kitchen_1', text: 'מקרר: ריקון מזון + ניקוי מדפים ומגירות', hasInventory: false },
      { id: 'kitchen_2', text: 'ניקוי מיקרוגל, תנור, קומקום וטוסטר', hasInventory: false },
      { id: 'kitchen_3', text: 'כיריים: הסרת שומנים וניקוי יסודי', hasInventory: false },
      { id: 'kitchen_4', text: 'כיור וברז: ניקוי והברקה (כולל אבנית)', hasInventory: false },
      { id: 'kitchen_5', text: 'ארונות: ניגוב חזיתות וניקוי מגירת סכו"ם', hasInventory: false },
      { id: 'kitchen_6', text: 'מלאי: ערכת קפה/תה (סוכר, תה, קפה, ממתיק)', hasInventory: true },
      { id: 'kitchen_7', text: 'קפסולות למכונת קפה (2 לאורח ליום)', hasInventory: true },
      { id: 'kitchen_8', text: 'נוזל כלים וספוג חדש ותקין', hasInventory: true },
      { id: 'kitchen_9', text: 'כלים: וידוא 6 מערכות נקיות ויבשות', hasInventory: false },
    ],
  },
  {
    name: '3. חדר רחצה ושירותים',
    tasks: [
      { id: 'bathroom_1', text: 'אסלה: חיטוי מלא (כולל בסיס ומאחור)', hasInventory: false },
      { id: 'bathroom_2', text: 'מקלחת: ניקוי קירות, רצפה וזכוכיות', hasInventory: false },
      { id: 'bathroom_3', text: 'מראות: ניקוי ללא סימני ניגוב', hasInventory: false },
      { id: 'bathroom_4', text: 'מגבת גוף גדולה לכל אורח (על המיטה)', hasInventory: true },
      { id: 'bathroom_5', text: 'מגבת פנים/ידיים לכל אורח (על המיטה)', hasInventory: true },
      { id: 'bathroom_6', text: 'מגבת פנים בחדר מקלחת (סולם/מתקן)', hasInventory: true },
      { id: 'bathroom_7', text: 'מגבת רגליים נקיה על הרצפה', hasInventory: true },
      { id: 'bathroom_8', text: 'נייר טואלט: 1 על המתקן + 3-4 ברצפה + 2 רזרבה', hasInventory: true },
      { id: 'bathroom_9', text: 'שמפו/מרכך/סבון - מילוי אם פחות מחצי', hasInventory: true },
    ],
  },
  {
    name: '4. חדר שינה',
    tasks: [
      { id: 'bedroom_1', text: 'מצעים: החלפה מלאה (סדין, ציפיות, שמיכה)', hasInventory: true },
      { id: 'bedroom_2', text: 'וידוא אין כתמים או שיערות על מצעים', hasInventory: false },
      { id: 'bedroom_3', text: 'ניגוב שידות לילה ומסגרת המיטה', hasInventory: false },
      { id: 'bedroom_4', text: 'ארון: ניקוי מדפים + 6 קולבים תקינים', hasInventory: false },
      { id: 'bedroom_5', text: 'תאורת לילה עובדת + שלט מזגן במקום', hasInventory: false },
    ],
  },
  {
    name: '5. סלון וכללי',
    tasks: [
      { id: 'living_1', text: 'ניקוי אבק: שולחן, מזנון TV ומדפים', hasInventory: false },
      { id: 'living_2', text: 'ספה: שאיבת פירורים וסידור כריות', hasInventory: false },
      { id: 'living_3', text: 'בדיקת TV, אינטרנט וניקוי שלטים', hasInventory: false },
      { id: 'living_4', text: 'רצפה: שאיבה יסודית ושטיפה ריחנית', hasInventory: false },
      { id: 'living_5', text: 'חלונות ותריסים: ניקוי זכוכיות ומסילות', hasInventory: false },
    ],
  },
  {
    name: '6. בדיקת סיום וחוויית אורח',
    tasks: [
      { id: 'finish_1', text: 'וידוא ריח טוב (מבשם במידת הצורך)', hasInventory: false },
      { id: 'finish_2', text: 'בדיקת מים חמים (הדלקת דוד)', hasInventory: false },
      { id: 'finish_3', text: 'כיבוי כל האורות והמזגנים', hasInventory: false },
      { id: 'finish_4', text: 'ערכת וולקם במקום בולט (מים/שוקולד)', hasInventory: true },
      { id: 'finish_5', text: 'נעילת חלונות ודלת מרפסת', hasInventory: false },
      { id: 'finish_6', text: 'וידוא מפתחות/קודן מוכנים', hasInventory: false },
    ],
  },
];

export async function GET(request: NextRequest) {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const workSessionId = searchParams.get('workSessionId');

    if (!workSessionId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Work session ID is required' },
        { status: 400 }
      );
    }

    const session = workSessionsStorage.findById<WorkSession>(workSessionId);
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Work session not found' },
        { status: 404 }
      );
    }

    if (session.workerId !== auth.workerId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized access to work session' },
        { status: 403 }
      );
    }

    const worker = workersStorage.findById<Worker>(session.workerId);
    if (!worker) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Worker not found' },
        { status: 404 }
      );
    }

    const apartment = APARTMENTS.find((apt) => apt.id === session.apartmentId);
    if (!apartment) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Apartment not found' },
        { status: 404 }
      );
    }

    const inventoryUsed = inventoryLogsStorage.findMany<any>(
      (log: any) => log.workSessionId === workSessionId
    );

    const issuesReported = issuesStorage.findMany<any>(
      (issue: any) => issue.workSessionId === workSessionId
    );

    // Get task completions
    const taskCompletions = taskCompletionsStorage.findMany<TaskCompletion>(
      (completion: TaskCompletion) => completion.workSessionId === workSessionId
    );
    
    const completedTaskIds = new Set(taskCompletions.map(c => c.taskId));
    
    // Build tasks array with status
    const tasks: TaskWithStatus[] = [];
    let totalTasks = 0;
    
    TASK_CATEGORIES.forEach(category => {
      category.tasks.forEach(task => {
        totalTasks++;
        tasks.push({
          ...task,
          categoryName: category.name,
          completed: completedTaskIds.has(task.id),
        });
      });
    });
    
    const tasksCompleted = completedTaskIds.size;

    let duration: number | undefined;
    if (session.endTime) {
      duration = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
      duration = Math.floor(duration / 1000); // Convert to seconds
    }

    const summary: WorkSummary = {
      workSessionId,
      worker,
      apartment,
      startTime: session.startTime,
      endTime: session.endTime,
      duration,
      tasksCompleted,
      totalTasks,
      tasks,
      inventoryUsed,
      issuesReported,
    };

    return NextResponse.json<ApiResponse<WorkSummary>>({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Error generating work summary:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
