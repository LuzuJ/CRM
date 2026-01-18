import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, title, subtitle, headerActions, showSearch = true }) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header 
          title={title} 
          subtitle={subtitle} 
          actions={headerActions}
          showSearch={showSearch}
        />
        <main className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-background-dark">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
