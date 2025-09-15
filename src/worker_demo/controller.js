

function blockingOperation(){
    let count = 0;

    for (let i = 0; i < 20000000000; i++) {
      count++;
    }

    return count;
}

module.exports={ blockingOperation};

