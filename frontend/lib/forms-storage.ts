// Shared in-memory storage for forms
// This will reset on server restart, but forms will persist during the session
let formsStorage: any[] = [
  {
    _id: "sample-form-1",
    title: "Sample Form 1",
    description: "This is a sample form",
    createdAt: new Date().toISOString()
  },
  {
    _id: "sample-form-2",
    title: "Sample Form 2", 
    description: "Another sample form",
    createdAt: new Date().toISOString()
  }
]

export function getForms() {
  return formsStorage
}

export function addForm(form: any) {
  formsStorage.push(form)
  return form
}

export function findFormById(id: string) {
  return formsStorage.find(f => f._id === id)
}

export function deleteFormById(id: string) {
  const formIndex = formsStorage.findIndex(f => f._id === id)
  if (formIndex === -1) return null
  return formsStorage.splice(formIndex, 1)[0]
}
