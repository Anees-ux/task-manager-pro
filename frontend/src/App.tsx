import { AppProviders } from '@app/providers';
import { AppRouter } from '@app/router';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AppProviders>
      <AppRouter />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--tblr-bg-surface)',
            color: 'var(--tblr-body-color)',
            border: '1px solid var(--tblr-border-color)',
          },
        }}
      />
    </AppProviders>
  );
}

export default App;
