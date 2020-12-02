import socket
import common_ports


def validateIP(target):
  try:
    socket.inet_aton(target)
    return True
  except socket.error:
    return False

def validateURL(target):
  try:
    socket.gethostbyname(target)
    return True 
  except socket.error:
    return False 

def checkTarget(target):
  if not validateURL(target):
    if target[0].isdigit():
      return "Error: Invalid IP address"
    return "Error: Invalid hostname"
  return False

def portscan(target, port):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((target, port))
        return True
    except:
        return False
        
def getService(ports):
  services= dict()
  for port in ports:
    if port in common_ports.ports_and_services:
      services[port] = common_ports.ports_and_services[port]
  string = ""
  for k, v in services.items():
    string += str(k) + " "*5 + v + "\n"
  return string
  
def get_open_ports(target, port_range, verbose=False):
    open_ports = []
    if checkTarget(target):
      print(checkTarget(target))
    for port in range(port_range[0], port_range[-1]):
      if portscan(target, port):
        open_ports.append(port)

    if verbose:
      if validateIP(target):
        ip = target
        host = socket.gethostbyaddr(target)
      else :
        host = target
        ip = socket.gethostbyname(target)
      print("Open ports for " + host + " (" + ip + ")\nPORT     SERVICE\n" + getService(open_ports))
    else:
      return(open_ports)