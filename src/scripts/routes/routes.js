import RegisterPage from '../pages/auth/register/register-page';
import LoginPage from '../pages/auth/login/login-page';
import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import FavoritePage from '../pages/favorite/favorite-page';
import StoryDetailsPage from '../pages/story-details/story-details-page';
import AddPage from '../pages/add/add-page';
import BerandaPage from '../pages/beranda/beranda-page';
import NotFoundPage from '../pages/not-found/not-found-page';
import { checkAuthenticatedRoute, checkUnauthenticatedRouteOnly } from '../utils/profile';

export const routes = {
  '/': () => new BerandaPage(),
  '/login': () => checkUnauthenticatedRouteOnly(new LoginPage()),
  '/register': () => checkUnauthenticatedRouteOnly(new RegisterPage()),
  '/home': () => checkAuthenticatedRoute(new HomePage()),
  '/about': () => checkAuthenticatedRoute(new AboutPage()),
  '/favorite': () => checkAuthenticatedRoute(new FavoritePage()),
  '/add': () => checkAuthenticatedRoute(new AddPage()),
  '/story-details/:id': () => checkAuthenticatedRoute(new StoryDetailsPage()),
  '404': () => checkAuthenticatedRoute(new NotFoundPage()),
};
