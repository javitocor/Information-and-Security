import hashlib

def crack_sha1_hash(hash, use_salts=False):
    with open('top-10000-passwords.txt') as f:
      if use_salts:
        with open('known-salts.txt') as f2:
          for password in f:
            password = password.rstrip()
            with open('known-salts.txt') as f2:
              for salt in f2:
                salt = salt.rstrip()
                hash1 = password + salt
                hash2 = salt + password
                hash1hashed = hashlib.sha1(hash1.encode('utf-8')).hexdigest()
                hash2hashed = hashlib.sha1(hash2.encode('utf-8')).hexdigest()
                if hash1hashed == hash or hash2hashed == hash :
                  return password
      else:
        for password in f:
          password = password.rstrip()
          h = hashlib.sha1(password.encode('utf-8')).hexdigest()
          if hash == h:
            return password
    return "PASSWORD NOT IN DATABASE"
