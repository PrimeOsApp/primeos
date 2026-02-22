import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ENTITIES = [
  "PatientRecord", "Appointment", "ClinicalNote", "Dentist", "Resource", "DentistBlockout",
  "Customer", "Lead", "Interaction", "LeadInteraction", "CustomerSegment", "ClientJourney",
  "CRMAppointment", "CRMSyncSettings",
  "FinancialTransaction", "FinancialGoal", "Budget", "Expense", "Asset",
  "Campaign", "MarketingStrategy", "MarketingChannel", "MarketingMetric", "Channel",
  "Sale", "Product", "SalesScript", "ABTest", "EmailSequence", "CRMWorkflow",
  "Task", "POP", "SOP", "Activity", "AutomationWorkflow", "KnowledgeBase", "Document", "MedicalRecord",
  "InventoryItem",
  "SupportTicket", "FollowUpRule", "FollowUpLog", "FollowUp", "ReminderSchedule",
  "UserEngagement", "UserPoints", "UserBadge",
  "ProjetoSEO", "TarefaSEO", "PalavraChave", "ConteudoSEO", "Backlink", "RelatorioSEO",
  "PrimeGrowthStage", "PrimeFunnelLead", "PrimeDelegationTask",
  "ReportSchedule", "CustomDashboard", "KeyPartner", "ValueProposition", "BusinessStrategy",
  "Content",
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const result = {};
    const errors = {};

    for (const entity of ENTITIES) {
      try {
        const records = await base44.asServiceRole.entities[entity].list();
        result[entity] = records;
        console.log(`OK ${entity}: ${records.length} records`);
      } catch (e) {
        errors[entity] = e.message;
        console.warn(`SKIP ${entity}: ${e.message}`);
        result[entity] = [];
      }
    }

    const exportData = {
      exported_at: new Date().toISOString(),
      exported_by: user.email,
      app: "Prime Odontologia",
      total_entities: ENTITIES.length,
      entities_with_errors: Object.keys(errors),
      data: result,
    };

    if (Object.keys(errors).length > 0) {
      exportData._errors = errors;
    }

    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="prime_backup_${new Date().toISOString().slice(0,10)}.json"`,
      },
    });
  } catch (error) {
    console.error('Export failed:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});