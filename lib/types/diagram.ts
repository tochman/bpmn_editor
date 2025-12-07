// Types for bpmn_profiles table
export interface BpmnProfile {
  id: string;
  first_name: string;
  last_name: string;
  usage_type: 'private' | 'professional';
  created_at: string;
  updated_at: string;
}

// Types for bpmn_diagrams table
export interface BpmnDiagram {
  id: string;
  user_id: string;
  name: string;
  xml_content: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface DiagramInsert {
  name: string;
  xml_content: string;
  metadata?: Record<string, unknown>;
}

export interface DiagramUpdate {
  name?: string;
  xml_content?: string;
  metadata?: Record<string, unknown>;
}

// Legacy aliases for backward compatibility
export type Profile = BpmnProfile;
export type Diagram = BpmnDiagram;
