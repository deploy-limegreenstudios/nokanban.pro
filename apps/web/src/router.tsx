import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HomeLayout } from './layouts/HomeLayout'
import { GlobalError } from './pages/GlobalError'
import { Home } from './pages/Home'
import { LocalBoard } from './pages/LocalBoard'
import { NotFound } from './pages/NotFound'
import { SharedBoard } from './pages/SharedBoard'

const Router = () => {
  return (
    <BrowserRouter>
      <GlobalError>
        <Routes>
          <Route element={<HomeLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/local/:id" element={<LocalBoard />} />
            <Route path="/board/:name" element={<SharedBoard />} />
          </Route>
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </GlobalError>
    </BrowserRouter>
  )
}

export default Router
