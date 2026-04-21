import Header from './Header'
import Sidebar from './Sidebar'

function MainLayout({ children, breadcrumb }) {
  return (
    <div className="flex">
      <Sidebar />
      <Header breadcrumb={breadcrumb} />
      <main
        className="min-h-screen w-full bg-surface-secondary p-6"
        style={{
          marginLeft: 'var(--sidebar-width)',
          paddingTop: 'calc(var(--header-height) + 1.5rem)',
        }}
      >
        {children}
      </main>
    </div>
  )
}

export default MainLayout
