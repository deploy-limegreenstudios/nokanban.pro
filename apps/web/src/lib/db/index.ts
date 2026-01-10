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

const db = new Dexie('NoKanbanDB') as Dexie & {
  boards: EntityTable<LocalBoard, 'id'>
  columns: EntityTable<LocalColumn, 'id'>
  cards: EntityTable<LocalCard, 'id'>
}

db.version(1).stores({
  boards: 'id, name, &name',
  columns: 'id, boardId, position',
  cards: 'id, columnId, position',
})

export { db }
