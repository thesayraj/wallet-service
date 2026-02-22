class Snowflake {
  constructor(workerId, epoch = 1735689600000n) {
    this.workerId = BigInt(workerId);
    this.epoch = BigInt(epoch);
    this.sequence = 0n;
    this.lastTimestamp = -1n;
  }

  generate() {
    let timestamp = BigInt(Date.now());
    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1n) & 4095n;
      if (this.sequence === 0n) {
        while (timestamp <= this.lastTimestamp) timestamp = BigInt(Date.now());
      }
    } else {
      this.sequence = 0n;
    }
    this.lastTimestamp = timestamp;
    return (
      ((timestamp - this.epoch) << 22n) | (this.workerId << 12n) | this.sequence
    );
  }
}
module.exports = new Snowflake(process.env.WORKER_ID || 1);
