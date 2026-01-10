const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787/api/v1'

export interface ApiBoard {
  id: string
  name: string
  title: string
  createdAt: Date
  updatedAt: Date
}

export interface ApiColumn {
  id: string
  title: string
  position: number
  cards: ApiCard[]
  createdAt: Date
  updatedAt: Date
}

export interface ApiCard {
  id: string
  content: string
  position: number
  createdAt: Date
  updatedAt: Date
}

export interface ApiBoardData {
  id: string
  name: string
  title: string
  columns: ApiColumn[]
  createdAt: Date
  updatedAt: Date
}

export class BoardService {
  private baseUrl: string
  private pin: string | null = null

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  setPin(pin: string) {
    this.pin = pin
  }

  clearPin() {
    this.pin = null
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (options.headers) {
      Object.assign(headers, options.headers)
    }

    if (this.pin) {
      headers['X-Board-Pin'] = this.pin
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async createBoard(name: string, title: string, pin: string): Promise<ApiBoard> {
    return this.request<ApiBoard>('/boards', {
      method: 'POST',
      body: JSON.stringify({ name, title, pin }),
    })
  }

  async getBoard(name: string): Promise<ApiBoardData> {
    return this.request<ApiBoardData>(`/boards/${name}`)
  }

  async deleteBoard(name: string): Promise<void> {
    await this.request<void>(`/boards/${name}`, {
      method: 'DELETE',
    })
  }

  async createColumn(boardName: string, title: string, position: number): Promise<ApiColumn> {
    return this.request<ApiColumn>(`/boards/${boardName}/columns`, {
      method: 'POST',
      body: JSON.stringify({ title, position }),
    })
  }

  async updateColumnTitle(boardName: string, columnId: string, title: string): Promise<ApiColumn> {
    return this.request<ApiColumn>(`/boards/${boardName}/columns/${columnId}/title`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    })
  }

  async reorderColumns(
    boardName: string,
    columns: Array<{ id: string; position: number }>,
  ): Promise<void> {
    await this.request<void>(`/boards/${boardName}/columns/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ columns }),
    })
  }

  async deleteColumn(boardName: string, columnId: string): Promise<void> {
    await this.request<void>(`/boards/${boardName}/columns/${columnId}`, {
      method: 'DELETE',
    })
  }

  async createCard(
    boardName: string,
    columnId: string,
    content: string,
    position: number,
  ): Promise<ApiCard> {
    return this.request<ApiCard>(`/boards/${boardName}/columns/${columnId}/cards`, {
      method: 'POST',
      body: JSON.stringify({ content, position }),
    })
  }

  async updateCardContent(boardName: string, cardId: string, content: string): Promise<ApiCard> {
    return this.request<ApiCard>(`/boards/${boardName}/cards/${cardId}/content`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    })
  }

  async moveCard(
    boardName: string,
    cardId: string,
    columnId: string,
    position: number,
  ): Promise<ApiCard> {
    return this.request<ApiCard>(`/boards/${boardName}/cards/${cardId}/move`, {
      method: 'PATCH',
      body: JSON.stringify({ columnId, position }),
    })
  }

  async reorderCards(
    boardName: string,
    columnId: string,
    cards: Array<{ id: string; position: number }>,
  ): Promise<void> {
    await this.request<void>(`/boards/${boardName}/columns/${columnId}/cards/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ cards }),
    })
  }

  async deleteCard(boardName: string, cardId: string): Promise<void> {
    await this.request<void>(`/boards/${boardName}/cards/${cardId}`, {
      method: 'DELETE',
    })
  }
}

export const boardService = new BoardService()
