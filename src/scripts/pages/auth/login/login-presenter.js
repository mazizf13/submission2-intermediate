export default class LoginPresenter {
  #view;
  #model;
  #profileModel;

  constructor({ view, model, profileModel }) {
    this.#view = view;
    this.#model = model;
    this.#profileModel = profileModel;
  }

  async getLogin({ email, password }) {
    this.#view.showSubmitLoadingButton();
    try {
      const response = await this.#model.getLogin({ email, password });

      if (!response.ok) {
        this.#view.loginFailed(response.message);
        return;
      }

      this.#profileModel.putAccessToken(response.loginResult.token);
      this.#view.loginSuccessfully(response.message);
    } catch (error) {
      this.#view.loginFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
