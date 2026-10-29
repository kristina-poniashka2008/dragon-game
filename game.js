// Браузерная версия игры. Логика организована с помощью классов, как в исходном Python-проекте.
class Dragon {
  constructor() {
    this.maxHp = this.hp = randomInt(50, 150);
    this.hit = randomInt(5, 10);
    this.superHit = randomInt(10, 20);
    this.fireCount = randomInt(1, 2) === 1 ? randomInt(1, 3) : 0;
  }
  attack() {
    if (this.fireCount > 0 && Math.random() < 0.45) {
      this.fireCount--;
      return { damage: this.superHit, name: "огнём", fire: true };
    }
    return { damage: this.hit, name: "обычным ударом", fire: false };
  }
}
class Player {
  constructor() {
    this.maxHp = this.hp = randomInt(75, 100);
    this.hit = randomInt(5, 10);
    this.superHit = randomInt(10, 20);
    this.ultimates = randomInt(1, 3);
    this.maxShield = this.shield = randomInt(15, 25);
    this.shieldReady = false;
  }
}
class Game {
  constructor() {
    this.round = 1;
    this.log = [];
    this.reset();
  }
  reset() {
    this.dragon = new Dragon();
    this.player = new Player();
    this.over = false;
    this.log = [];
    this.turn = Math.random() < 0.5 ? "player" : "dragon";
    this.render();
    this.addLog(this.turn === "player" ? "Рыцарь получает право первого удара!" : "Дракон первым выходит из тьмы…");
    this.updateTurn();
  }
  addLog(message, type = "") {
    this.log.unshift({ message, type });
    this.log = this.log.slice(0, 30);
    const list = document.getElementById("battleLog");
    list.innerHTML = "";
    this.log.forEach(entry => {
      const li = document.createElement("li");
      li.textContent = entry.message;
      if (entry.type) li.className = entry.type;
      list.appendChild(li);
    });
    this.render();
  }
  playerAttack(useUltimate = false) {
    if (this.over || this.turn !== "player") return;
    if (useUltimate) {
      if (this.player.ultimates <= 0) return;
      const damage = this.player.superHit;
      this.player.ultimates--;
      this.dragon.hp = Math.max(0, this.dragon.hp - damage);
      this.addLog(`Рыцарь обрушивает суперудар и наносит ${damage} урона!`, "good");
    } else {
      this.dragon.hp = Math.max(0, this.dragon.hp - this.player.hit);
      this.addLog(`Рыцарь атакует мечом: ${this.player.hit} урона.`, "good");
    }
    if (this.checkEnd()) return;
    this.turn = "dragon";
    this.updateTurn();
    setTimeout(() => this.dragonAttack(), 650);
  }
  prepareShield() {
    if (this.over || this.turn !== "player") return;
    this.player.shieldReady = true;
    this.addLog("Рыцарь поднял щит и готовится отразить следующий удар.", "good");
    this.turn = "dragon";
    this.updateTurn();
    setTimeout(() => this.dragonAttack(), 650);
  }
  dragonAttack() {
    if (this.over) return;
    const attack = this.dragon.attack();
    if (this.player.shieldReady && this.player.shield > 0) {
      const absorbed = Math.min(this.player.shield, attack.damage);
      this.player.shield = Math.max(0, this.player.shield - attack.damage);
      const remaining = attack.damage - absorbed;
      if (remaining > 0) this.player.hp = Math.max(0, this.player.hp - remaining);
      this.player.shieldReady = false;
      this.addLog(`Щит поглощает ${absorbed} урона${remaining ? `, рыцарь получает ещё ${remaining}` : ""}. ${attack.fire ? "Дракон дышит огнём!" : ""}`, "danger");
    } else {
      this.player.hp = Math.max(0, this.player.hp - attack.damage);
      this.addLog(`Дракон атакует ${attack.name} и наносит ${attack.damage} урона!`, "danger");
    }
    if (this.checkEnd()) return;
    this.turn = "player";
    this.updateTurn();
    this.render();
  }
  checkEnd() {
    if (this.dragon.hp <= 0 || this.player.hp <= 0) {
      this.over = true;
      if (this.dragon.hp <= 0 && this.player.hp <= 0) {
        this.addLog("Оба бойца пали. Ничья!", "muted");
        this.finish("НИЧЬЯ", "Оба бойца пали в этой битве.");
      } else if (this.dragon.hp <= 0) {
        this.addLog("Дракон повержен! Победа рыцаря!", "good");
        this.finish("ПОБЕДА!", "Ты победил древнего дракона!");
      } else {
        this.addLog("Рыцарь пал. Дракон победил…", "danger");
        this.finish("ПОРАЖЕНИЕ", "Дракон оказался сильнее. Попробуй ещё раз.");
      }
      this.render();
      return true;
    }
    return false;
  }
  finish(title, hint) {
    document.getElementById("turnTitle").textContent = title;
    document.getElementById("hintText").textContent = hint;
    document.getElementById("turnIndicator").textContent = "● БИТВА ОКОНЧЕНА";
    document.getElementById("turnIndicator").style.color = title === "ПОБЕДА!" ? "#70c99c" : "#df5358";
    this.updateButtons();
  }
  updateTurn() {
    if (this.over) return;
    const playerTurn = this.turn === "player";
    document.getElementById("turnTitle").textContent = playerTurn ? "Твой ход, рыцарь" : "Ход дракона…";
    document.getElementById("hintText").textContent = playerTurn
      ? (this.player.shieldReady ? "Щит поднят — выбери атаку или приготовься к удару." : "Выбери действие. Береги суперудары и следи за прочностью щита.")
      : "Дракон готовит ответную атаку…";
    document.getElementById("turnIndicator").textContent = playerTurn ? "● ТВОЙ ХОД" : "● ХОД ДРАКОНА";
    document.getElementById("turnIndicator").style.color = playerTurn ? "#e7b76b" : "#df7779";
    this.updateButtons();
  }
  updateButtons() {
    const playerTurn = this.turn === "player" && !this.over;
    document.getElementById("attackBtn").disabled = !playerTurn;
    document.getElementById("ultimateBtn").disabled = !playerTurn || this.player.ultimates <= 0;
    document.getElementById("shieldBtn").disabled = !playerTurn || this.player.shield <= 0 || this.player.shieldReady;
  }
  render() {
    if (!this.dragon || !this.player) return;
    setText("dragonHpText", `${this.dragon.hp} / ${this.dragon.maxHp}`);
    setText("playerHpText", `${this.player.hp} / ${this.player.maxHp}`);
    setText("dragonHit", this.dragon.hit);
    setText("dragonFireCount", this.dragon.fireCount);
    setText("playerHit", this.player.hit);
    setText("playerUltCount", this.player.ultimates);
    setText("shieldText", `${this.player.shield} / ${this.player.maxShield}${this.player.shieldReady ? " · поднят" : ""}`);
    document.getElementById("dragonHpBar").style.width = `${Math.max(0, this.dragon.hp / this.dragon.maxHp * 100)}%`;
    document.getElementById("playerHpBar").style.width = `${Math.max(0, this.player.hp / this.player.maxHp * 100)}%`;
    document.getElementById("roundBadge").textContent = `БИТВА ${String(this.round).padStart(2, "0")}`;
    this.updateButtons();
  }
}
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function setText(id, value) { document.getElementById(id).textContent = value; }

const game = new Game();
document.getElementById("attackBtn").addEventListener("click", () => game.playerAttack(false));
document.getElementById("ultimateBtn").addEventListener("click", () => game.playerAttack(true));
document.getElementById("shieldBtn").addEventListener("click", () => game.prepareShield());
document.getElementById("restartBtn").addEventListener("click", () => {
  game.round++;
  game.reset();
});
document.getElementById("clearLogBtn").addEventListener("click", () => {
  game.log = [];
  game.addLog("Хроника очищена. Битва продолжается.");
});
