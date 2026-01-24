// services/ContactService.ts
import api from "./api";

/* ================= INTERFACES ================= */

export interface Contact {
  id: number;
  fullname: string;
  email?: string | null;
  phone?: string | null;
  message: string;
  reply?: string | null;
  status?: 0 | 1;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedContacts {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  data: Contact[];
}

/* ===== Params đúng với ContactController@index ===== */
export interface ContactListParams {
  keyword?: string;
  status?: 0 | 1;
  from_date?: string; // YYYY-MM-DD
  to_date?: string;   // YYYY-MM-DD
  sort_by?: "created_at" | "fullname";
  sort_order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

/* ================= SERVICE ================= */

const ContactService = {
  /* ========== LIST ========== */
  async list(params?: ContactListParams): Promise<PaginatedContacts> {
    const response = await api.get("/contacts", { params });
    return response.data;
  },

  /* ========== DETAIL ========== */
  async get(id: number): Promise<Contact> {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },

  /* ========== CREATE ========== */
  async create(data: {
    fullname: string;
    email?: string;
    phone?: string;
    message: string;
    reply?: string;
    status?: 0 | 1;
  }): Promise<Contact> {
    const response = await api.post("/contacts", data);
    return response.data;
  },

  /* ========== UPDATE ========== */
  async update(
    id: number,
    data: {
      fullname?: string;
      email?: string;
      phone?: string;
      message?: string;
      reply?: string;
      status?: 0 | 1;
    }
  ): Promise<Contact> {
    const response = await api.put(`/contacts/${id}`, data);
    return response.data;
  },

  /* ========== DELETE ========== */
  async delete(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  },
};

export default ContactService;
