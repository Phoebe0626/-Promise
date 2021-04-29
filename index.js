class MPromise {
  static PENDING = 'pending';
  static FULFILLED = 'fulfilled';
  static REJECTED = 'rejected';

  constructor(executor) {
    this.status = MPromise.PENDING;
    this.value = null;
    this.callbacks = [];
    try {
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (error) { // 发生错误 状态改为 rejected
      this.reject(error)
    }
  }

  resolve(value) {
    if (this.status === MPromise.PENDING) {
      this.status = MPromise.FULFILLED;
      this.value = value;
      setTimeout(() => {
        this.callbacks.map(callback => {
          callback.onFulfilled(value);
        }); 
      });
    }
  }

  reject(reason) {
    if (this.status === MPromise.PENDING) {
      this.status = MPromise.REJECTED;
      this.value = reason;
      setTimeout(() => {
        this.callbacks.map(callback => {
          callback.onRejected(reason);
        }) 
      });
    }
  }

  then(onFulfilled, onRejected) {
    if (typeof onFulfilled !== 'function') { // then 的穿透
      onFulfilled = () => this.value;
    }
    if (typeof onRejected !== 'function') {
      onRejected = () => this.value;
    }
    return new MPromise((resolve, reject) => {
      // 待定状态
      if (this.status === MPromise.PENDING) {
        this.callbacks.push({
          onFulfilled: value => {
            try {
              let result = onFulfilled(this.value)
              resolve(result);
            } catch (error) {
              reject(error);
            }
          },
          onRejected: reason => {
            try {
              let result = onRejected(this.value)
              resolve(result);
            } catch (error) {
              reject(error);
            }
          }
        })
      }
      
      // 成功状态
      if (this.status === MPromise.FULFILLED) {
        setTimeout(() => {
          try {
            let result = onFulfilled(this.value)
            resolve(result);
          } catch (error) {
            reject(error);
          } 
        });
      }
      
      // 失败状态
      if (this.status === MPromise.REJECTED) {
        setTimeout(() => {
          try {
            let result = onRejected(this.value)
            resolve(result);
          } catch (error) {
            onRejected(error);
          } 
        });
      }
    })
  }
}