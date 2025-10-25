'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfile(session.user.id)
      else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const email = user?.email || 'user@example.com'
        const name = email.split('@')[0]
        const initials = name.substring(0, 2).toUpperCase()
        
        const { data: newProfile } = await supabase
          .from('user_profiles')
          .insert([{ user_id: userId, full_name: name, initials, email }])
          .select()
          .single()
        
        setProfile(newProfile)
      } else {
        setProfile(data)
      }
    } catch (err) {
      console.error('Profile error:', err)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="loading" />
      </div>
    )
  }

  if (!user || !profile) {
    return <AuthForm onSuccess={loadProfile} />
  }

  return <MainApp user={user} profile={profile} />
}

function AuthForm({ onSuccess }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      onSuccess(data.user.id)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error
      alert('✅ Cont creat! Verifică emailul pentru confirmare.')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">TaskBoard Pro</h1>
        <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Parolă"
            minLength={6}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <button
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="w-full mt-4 text-blue-600 text-sm hover:underline"
        >
          {mode === 'login' ? 'Creează cont nou' : 'Am cont deja'}
        </button>
      </div>
    </div>
  )
}

function MainApp({ user, profile }) {
  const [view, setView] = useState('home')
  const [projects, setProjects] = useState([])
  const [showNewProject, setShowNewProject] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('is_archived', false)
        .order('created_at', { ascending: false })

      if (data) setProjects(data)
    } catch (err) {
      console.error('Load projects error:', err)
    }
  }

  const createProject = async (name, description) => {
    try {
      const { data: newProject, error } = await supabase
        .from('projects')
        .insert([{ name, description, owner_id: profile.user_id }])
        .select()
        .single()

      if (error) throw error

      // Add user as member
      await supabase.from('project_members').insert([
        {
          project_id: newProject.id,
          user_id: profile.user_id,
          role: 'editor',
          added_by: profile.user_id,
        },
      ])

      setShowNewProject(false)
      loadProjects()
    } catch (err) {
      alert('Eroare: ' + err.message)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-bold text-lg">TaskBoard Pro</h2>
          <p className="text-xs text-gray-500">{profile.full_name}</p>
        </div>
        <button
          onClick={() => setView('home')}
          className={`mx-2 my-2 px-4 py-3 rounded-lg text-left ${
            view === 'home'
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'hover:bg-gray-50'
          }`}
        >
          🏠 Dashboard
        </button>
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
          Proiecte
        </div>
        <div className="flex-1 overflow-y-auto px-2">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setView(p.id)}
              className={`w-full px-4 py-3 rounded-lg mb-1 text-left ${
                view === p.id
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'hover:bg-gray-50'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="p-4 border-t space-y-2">
          <button
            onClick={() => setShowNewProject(true)}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            + Proiect Nou
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-gray-600 py-2 rounded-lg hover:bg-gray-50"
          >
            Ieșire
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {view === 'home' ? (
          <Dashboard userId={user.id} />
        ) : (
          <ProjectView projectId={view} userId={user.id} />
        )}
      </div>

      {/* New Project Modal */}
      {showNewProject && (
        <NewProjectModal
          onClose={() => setShowNewProject(false)}
          onCreate={createProject}
        />
      )}
    </div>
  )
}

function Dashboard({ userId }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const { data } = await supabase
        .from('task_assignments')
        .select('task_id, tasks(*, project:projects(name), checklist_items(*))')
        .eq('user_id', userId)

      if (data) {
        const myTasks = data
          .map((d) => d.tasks)
          .filter((t) => t && t.column_id !== 'done')
        setTasks(myTasks)
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="loading" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Taskurile Mele</h2>
      {tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => {
            const items = task.checklist_items || []
            const done = items.filter((i) => i.is_completed).length
            const hasOverdue = items.some(
              (i) =>
                !i.is_completed &&
                i.due_date &&
                new Date(i.due_date) < new Date()
            )

            return (
              <div
                key={task.id}
                className={`bg-white p-4 rounded-lg shadow border-l-4 ${
                  hasOverdue ? 'border-red-500' : 'border-blue-500'
                }`}
              >
                <h3 className="font-semibold mb-2">{task.title}</h3>
                <div className="text-sm text-gray-600 mb-2">
                  📁 {task.project?.name}
                </div>
                {hasOverdue && (
                  <div className="overdue mb-2">⚠️ Deadline depășit!</div>
                )}
                {items.length > 0 && (
                  <div className="text-sm">
                    {done}/{items.length} completate
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-600">Niciun task asignat</p>
        </div>
      )}
    </div>
  )
}

function ProjectView({ projectId, userId }) {
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [isEditor, setIsEditor] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showInvite, setShowInvite] = useState(false)

  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    try {
      // Load project
      const { data: proj } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (proj) {
        setProject(proj)
        setIsEditor(proj.owner_id === userId)
      }

      // Check if user is editor member
      if (!isEditor) {
        const { data: member } = await supabase
          .from('project_members')
          .select('role')
          .eq('project_id', projectId)
          .eq('user_id', userId)
          .single()

        if (member?.role === 'editor') setIsEditor(true)
      }

      // Load members
      const { data: mem } = await supabase
        .from('project_members')
        .select('*, user_profiles(*)')
        .eq('project_id', projectId)

      if (mem) setMembers(mem)

      // Load tasks
      const { data: t } = await supabase
        .from('tasks')
        .select('*, checklist_items(*), task_assignments(*, user_profiles(*))')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (t) setTasks(t)
    } catch (err) {
      console.error(err)
    }
  }

  const addTask = async (columnId, title) => {
    if (!isEditor) return

    try {
      await supabase
        .from('tasks')
        .insert([
          {
            project_id: projectId,
            title,
            column_id: columnId,
            created_by: userId,
          },
        ])

      loadProject()
    } catch (err) {
      alert('Eroare: ' + err.message)
    }
  }

  const deleteTask = async (taskId) => {
    if (!isEditor || !confirm('Ștergi taskul?')) return

    try {
      await supabase.from('tasks').delete().eq('id', taskId)
      loadProject()
    } catch (err) {
      alert('Eroare: ' + err.message)
    }
  }

  const moveTask = async (taskId, newColumn) => {
    if (!isEditor) return

    try {
      await supabase
        .from('tasks')
        .update({ column_id: newColumn })
        .eq('id', taskId)

      loadProject()
    } catch (err) {
      alert('Eroare: ' + err.message)
    }
  }

  const columns = [
    { id: 'todo', name: 'De făcut', bg: 'bg-blue-100' },
    { id: 'in-progress', name: 'În lucru', bg: 'bg-yellow-100' },
    { id: 'done', name: 'Finalizat', bg: 'bg-green-100' },
  ]

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className="text-xl font-bold">{project.name}</h2>
            <span
              className={`inline-block px-3 py-1 rounded text-sm mt-2 ${
                isEditor
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {isEditor ? '✏️ EDITOR' : '👁️ VIEWER'}
            </span>
          </div>
          {isEditor && (
            <button
              onClick={() => setShowInvite(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <span>📧</span>
              <span>Invită</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Membri:</span>
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded text-sm"
            >
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {m.user_profiles?.initials || '?'}
              </div>
              <span>{m.user_profiles?.full_name || 'User'}</span>
              <span className="text-gray-500 text-xs">({m.role})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 p-6 overflow-x-auto bg-gray-50">
        <div className="grid grid-cols-3 gap-6 min-w-max">
          {columns.map((col) => (
            <Column
              key={col.id}
              column={col}
              tasks={tasks.filter((t) => t.column_id === col.id)}
              canEdit={isEditor}
              onAddTask={addTask}
              onDeleteTask={deleteTask}
              onTaskClick={setSelectedTask}
              onMoveTask={moveTask}
            />
          ))}
        </div>
      </div>

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          canEdit={isEditor}
          userId={userId}
          onClose={() => {
            setSelectedTask(null)
            loadProject()
          }}
          onMoveTask={moveTask}
        />
      )}

      {/* Invite Modal */}
      {showInvite && (
        <InviteModal
          projectId={projectId}
          members={members}
          userId={userId}
          onClose={() => setShowInvite(false)}
          onSuccess={() => {
            setShowInvite(false)
            loadProject()
          }}
        />
      )}
    </div>
  )
}

function Column({ column, tasks, canEdit, onAddTask, onDeleteTask, onTaskClick, onMoveTask }) {
  const [showInput, setShowInput] = useState(false)
  const [title, setTitle] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const handleAdd = () => {
    if (!title.trim()) return
    onAddTask(column.id, title)
    setTitle('')
    setShowInput(false)
  }

  return (
    <div
      className={`bg-white rounded-xl border p-4 flex flex-col min-w-[300px] transition ${
        dragOver ? 'drag-over' : ''
      }`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        const taskId = e.dataTransfer.getData('taskId')
        if (taskId && canEdit) onMoveTask(taskId, column.id)
      }}
    >
      <div className={`${column.bg} rounded-lg p-3 mb-4`}>
        <h3 className="font-bold text-lg">{column.name}</h3>
        <p className="text-sm text-gray-600">{tasks.length} task-uri</p>
      </div>

      <div className="flex-1 space-y-3 mb-4 min-h-[200px]">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            canEdit={canEdit}
            onDelete={onDeleteTask}
            onClick={onTaskClick}
          />
        ))}
      </div>

      {canEdit &&
        (showInput ? (
          <div className="space-y-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Titlu task..."
              className="w-full px-3 py-2 border rounded-lg"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm"
              >
                Adaugă
              </button>
              <button
                onClick={() => {
                  setShowInput(false)
                  setTitle('')
                }}
                className="flex-1 bg-gray-200 py-2 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="w-full py-2 border-2 border-dashed rounded-lg hover:border-blue-400 text-gray-600 text-sm"
          >
            + Adaugă Task
          </button>
        ))}
    </div>
  )
}

function TaskCard({ task, canEdit, onDelete, onClick }) {
  const [dragging, setDragging] = useState(false)
  const items = task.checklist_items || []
  const assigns = task.task_assignments || []
  const done = items.filter((i) => i.is_completed).length
  const hasOverdue = items.some(
    (i) =>
      !i.is_completed && i.due_date && new Date(i.due_date) < new Date()
  )

  return (
    <div
      draggable={canEdit}
      onDragStart={(e) => {
        e.dataTransfer.setData('taskId', task.id)
        setDragging(true)
      }}
      onDragEnd={() => setDragging(false)}
      onClick={() => onClick(task)}
      className={`bg-white border-2 rounded-lg p-3 cursor-pointer hover:shadow-md group ${
        hasOverdue ? 'border-red-300' : 'border-gray-200'
      } ${dragging ? 'dragging' : ''}`}
    >
      <div className="flex justify-between mb-2">
        <p className="font-medium flex-1">{task.title}</p>
        {canEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task.id)
            }}
            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
          >
            ✕
          </button>
        )}
      </div>

      {items.length > 0 && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>
              📋 {done}/{items.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded h-2">
            <div
              className={`h-2 rounded ${
                hasOverdue ? 'bg-red-500' : 'bg-blue-600'
              }`}
              style={{
                width: `${items.length > 0 ? (done / items.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {assigns.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {assigns.map((a) => (
            <div
              key={a.id}
              className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold"
              title={a.user_profiles?.full_name || 'User'}
            >
              {a.user_profiles?.initials || '?'}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TaskModal({ task, canEdit, userId, onClose, onMoveTask }) {
  const [checklist, setChecklist] = useState([])
  const [assignments, setAssignments] = useState([])
  const [users, setUsers] = useState([])
  const [newItemTitle, setNewItemTitle] = useState('')
  const [newItemDate, setNewItemDate] = useState('')

  useEffect(() => {
    loadTaskData()
  }, [task.id])

  const loadTaskData = async () => {
    try {
      const { data: items } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('task_id', task.id)
        .order('position')

      if (items) setChecklist(items)

      const { data: assigns } = await supabase
        .from('task_assignments')
        .select('*, user_profiles(*)')
        .eq('task_id', task.id)

      if (assigns) setAssignments(assigns)

      const { data: allUsers } = await supabase.from('user_profiles').select('*')

      if (allUsers) setUsers(allUsers)
    } catch (err) {
      console.error(err)
    }
  }

  const addChecklistItem = async () => {
    if (!newItemTitle.trim() || !canEdit) return

    try {
      await supabase.from('checklist_items').insert([
        {
          task_id: task.id,
          title: newItemTitle,
          due_date: newItemDate || null,
          position: checklist.length,
        },
      ])

      setNewItemTitle('')
      setNewItemDate('')
      loadTaskData()
    } catch (err) {
      alert('Eroare: ' + err.message)
    }
  }

  const toggleChecklistItem = async (item) => {
    if (!canEdit) return

    try {
      const newCompleted = !item.is_completed
      await supabase
        .from('checklist_items')
        .update({
          is_completed: newCompleted,
          completed_at: newCompleted ? new Date().toISOString() : null,
        })
        .eq('id', item.id)

      // Auto-move to in-progress on first completion
      if (newCompleted && task.column_id === 'todo') {
        const allItems = await supabase
          .from('checklist_items')
          .select('is_completed')
          .eq('task_id', task.id)

        const completedCount =
          allItems.data?.filter((i) => i.is_completed).length || 0

        if (completedCount === 1) {
          await onMoveTask(task.id, 'in-progress')
          alert('✅ Task mutat în "În lucru"!')
          onClose()
          return
        }
      }

      loadTaskData()
    } catch (err) {
      alert('Eroare: ' + err.message)
    }
  }

  const deleteChecklistItem = async (itemId) => {
    if (!canEdit) return

    try {
      await supabase.from('checklist_items').delete().eq('id', itemId)
      loadTaskData()
    } catch (err) {
      alert('Eroare: ' + err.message)
    }
  }

  const assignUser = async (userId) => {
    if (!canEdit) return

    try {
      await supabase
        .from('task_assignments')
        .insert([
          { task_id: task.id, user_id: userId, assigned_by: userId },
        ])

      loadTaskData()
    } catch (err) {
      alert('Eroare: ' + err.message)
    }
  }

  const unassignUser = async (assignmentId) => {
    if (!canEdit) return

    try {
      await supabase.from('task_assignments').delete().eq('id', assignmentId)
      loadTaskData()
    } catch (err) {
      alert('Eroare: ' + err.message)
    }
  }

  const availableUsers = users.filter(
    (u) => !assignments.some((a) => a.user_id === u.user_id)
  )

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex justify-between sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold">{task.title}</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Checklist */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              📋 Checklist
              {canEdit && (
                <span className="text-sm text-gray-500 font-normal ml-2">
                  (Primul bifat → mută automat în "În lucru")
                </span>
              )}
            </h3>
            <div className="space-y-2 mb-3">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-2 hover:bg-gray-50 rounded group"
                >
                  <input
                    type="checkbox"
                    checked={item.is_completed}
                    onChange={() => toggleChecklistItem(item)}
                    disabled={!canEdit}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p
                      className={
                        item.is_completed
                          ? 'line-through text-green-600'
                          : item.due_date &&
                            new Date(item.due_date) < new Date()
                          ? 'overdue'
                          : ''
                      }
                    >
                      {item.title}
                    </p>
                    {item.due_date && (
                      <p className="text-xs text-gray-500">
                        📅{' '}
                        {new Date(item.due_date).toLocaleString('ro-RO')}
                      </p>
                    )}
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => deleteChecklistItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-500"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
              {checklist.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Niciun item
                </p>
              )}
            </div>
            {canEdit && (
              <div className="space-y-2">
                <input
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder="Nou item..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    value={newItemDate}
                    onChange={(e) => setNewItemDate(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <button
                    onClick={addChecklistItem}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    Adaugă
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Assignments */}
          <div>
            <h3 className="text-lg font-semibold mb-3">👥 Asignări</h3>
            <div className="space-y-2 mb-3">
              {assignments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {a.user_profiles?.initials || '?'}
                    </div>
                    <span className="font-medium">
                      {a.user_profiles?.full_name || 'User'}
                    </span>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => unassignUser(a.id)}
                      className="text-red-500 text-sm font-medium"
                    >
                      Elimină
                    </button>
                  )}
                </div>
              ))}
              {assignments.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nicio asignare
                </p>
              )}
            </div>
            {canEdit && availableUsers.length > 0 && (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    assignUser(e.target.value)
                    e.target.value = ''
                  }
                }}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="">➕ Asignează...</option>
                {availableUsers.map((u) => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.full_name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="p-6 border-t sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 rounded-lg"
          >
            Închide
          </button>
        </div>
      </div>
    </div>
  )
}

function InviteModal({ projectId, members, userId, onClose, onSuccess }) {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [role, setRole] = useState('editor')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const { data } = await supabase.from('user_profiles').select('*')

      if (data) {
        const available = data.filter(
          (u) => !members.some((m) => m.user_id === u.user_id)
        )
        setUsers(available)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleInvite = async () => {
    if (!selectedUser) return
    setLoading(true)

    try {
      await supabase.from('project_members').insert([
        {
          project_id: projectId,
          user_id: selectedUser,
          role,
          added_by: userId,
        },
      ])

      alert('✅ Utilizator adăugat!')
      onSuccess()
    } catch (err) {
      alert('Eroare: ' + err.message)
    }
    setLoading(false)
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">📧 Invită Membri</h2>
        {users.length > 0 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Utilizator
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Alege...</option>
                {users.map((u) => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.full_name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rol</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="editor">✏️ Editor (poate modifica)</option>
                <option value="viewer">
                  👁️ Viewer (doar vizualizare)
                </option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleInvite}
                disabled={loading || !selectedUser}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg disabled:opacity-50"
              >
                {loading ? '...' : 'Invită'}
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 py-2 rounded-lg"
              >
                Anulează
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Nu există alți utilizatori în sistem.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Creează conturi noi prin "Sign Up"
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Închide
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function NewProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    onCreate(name, description)
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Proiect Nou</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nume proiect"
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descriere (opțional)"
            rows="3"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg"
            >
              {loading ? '...' : 'Creează'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 py-2 rounded-lg"
            >
              Anulează
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
