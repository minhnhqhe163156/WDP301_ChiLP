import { lazy } from "react";
const AdminLogin = lazy(() => import ("../../views/auth/AdminLogin.jsx"));
const LoginAndRegister = lazy(() => import('../../views/auth/LoginAndRegister.jsx'));
const Login = lazy(() => import('../../views/auth/Login.jsx'));
const Register = lazy(() => import('../../views/auth/Register.jsx'));
const CollectionProducts = lazy(() => import('../../views/collections/CollectionProducts.jsx'));
const CartPage = lazy(() => import('../../views/cart/CartPage.jsx'));
const BlogList = lazy(() => import('../../views/blog/BlogList.jsx'));

const publicRoutes = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/loginandregister",
    element: <LoginAndRegister />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/collections/:type/:value",
    element: <CollectionProducts />,
  },
  {
    path: "/cart",
    element: <CartPage />,
  },
  {
    path: "/blogs",
    element: <BlogList />,
  }
];
export default publicRoutes;
