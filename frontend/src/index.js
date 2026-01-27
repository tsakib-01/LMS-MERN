const { StrictMode } = React;
const { createRoot } = ReactDOM;
const { BrowserRouter } = ReactRouterDOM;

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Hello, MERN Frontend!
        </h1>
      </div>
    </BrowserRouter>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);