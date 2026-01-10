import Dexie, { type EntityTable } from 'dexie'

export interface LocalBoard {
  id: string
  name: string
  title: string
  createdAt: Date
  updatedAt: Date
}

export interface LocalColumn {
  id: string
  boardId: string
  title: string
  position: number
  createdAt: Date
  updatedAt: Date
}

export interface LocalCard {
  id: string
  columnId: string
  content: string
  position: number
  createdAt: Date
  updatedAt: Date
}

const database = new Dexie('nokanban') as Dexie & {
  boards: EntityTable<LocalBoard, 'id'>
  columns: EntityTable<LocalColumn, 'id'>
  cards: EntityTable<LocalCard, 'id'>
}

// Schema declaration
database.version(1).stores({
  boards: 'id, name, createdAt, updatedAt',
  columns: 'id, boardId, position, createdAt, updatedAt',
  cards: 'id, columnId, position, createdAt, updatedAt',
})

export const db = database
