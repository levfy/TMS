import { Toaster } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

function App() {
  const { t, i18n } = useTranslation()

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ru' ? 'kk' : 'ru')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">
            📦 KazDispatch
          </h1>
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            {i18n.language === 'ru' ? 'Қазақша' : 'Русский'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">{t('welcome')}</h2>
          <p className="text-xl text-gray-600 mb-8">{t('description')}</p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-4">🚚</div>
              <h3 className="text-lg font-semibold mb-2">{t('orders')}</h3>
              <p className="text-gray-600">{t('manage_orders')}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-4">🚗</div>
              <h3 className="text-lg font-semibold mb-2">{t('drivers')}</h3>
              <p className="text-gray-600">{t('manage_drivers')}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">{t('analytics')}</h3>
              <p className="text-gray-600">{t('view_reports')}</p>
            </div>
          </div>
        </div>
      </main>

      <Toaster />
    </div>
  )
}

export default App
