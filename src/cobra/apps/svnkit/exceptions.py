import pysvn


class SubversionError(Exception): pass

class InvalidNode(SubversionError): pass
class RepositoryNotFound(SubversionError): pass


def map_svn_exceptions(func):
    def new_func(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except pysvn.ClientError, error:
            error_code = error.args[1][0][1]
            if error_code in svn_error_map:
                raise svn_error_map[error_code]
            else:
                raise error

    new_func.__name__ = func.__name__
    new_func.__dict__ = func.__dict__
    new_func.__doc__ = func.__doc__
    new_func.__module__ = func.__module__

    return new_func


# map of common svn errors encountered by svnlit
svn_error_map = {
    160013: InvalidNode,
    210005: RepositoryNotFound,
}
