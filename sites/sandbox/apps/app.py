from cobra.app import Frame

# from apps.checkout.app import application as checkout_app


class Application(Frame):
    # Use local checkout app so we can mess with the view classes
    #checkout_app = checkout_app
    pass


application = Application()
