import pysvn


NODE_TYPE_NONE = 'N'
NODE_TYPE_FILE = 'F'
NODE_TYPE_DIR = 'D'
NODE_TYPE_UNKNOWN = '?'

NODE_TYPES = (
    (NODE_TYPE_NONE, 'Absent'),
    (NODE_TYPE_FILE, 'File'),
    (NODE_TYPE_DIR, 'Dir'),
    (NODE_TYPE_UNKNOWN, 'Unknown'),
)

NODE_TYPE_MAP = {
    pysvn.node_kind.none: NODE_TYPE_NONE,
    pysvn.node_kind.file: NODE_TYPE_FILE,
    pysvn.node_kind.dir: NODE_TYPE_DIR,
    pysvn.node_kind.unknown: NODE_TYPE_UNKNOWN,
}