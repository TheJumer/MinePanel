from mcrcon import MCRcon

def execute_rcon_command(command: str, ip: str, port: int, password: str) -> bool:
    try:
        with MCRcon(ip, password, port=port) as mcr:
            resp = mcr.command(command)
            print(f"[RCON SUCCESS] Command: '{command}' | Response: '{resp}'")
            return True
    except Exception as e:
        print(f"[RCON ERROR] Не вдалося виконати команду: {e}")
        return False