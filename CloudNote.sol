pragma solidity >=0.4.20 <0.7.0;
// 部署在Rinkeby测试网络上的合约地址为：0xa222a773d3964f7f3b12e6f9e6e39818fa18e136
contract CloudNote{
    // 用于保存每一条云笔记，key是云笔记标题名，value是云笔记内容。
    mapping(string=>string) private note;
    // 用于保存某账户的所有云笔记，key是用户id，value是用户的所有云笔记记录
    mapping(string=>mapping(string=>string)) private data;

    // 添加笔记（id：用户id；name：云笔记标题名；content：内容）
    function addNote(string memory id,string memory  name,string  memory content)
    idNotNull(id)  // 使用modifier（函数修饰符）方式校检，用户id不能为空
    nameNotNull(name) // 笔记标题名不能为空
    contentNotNull(content) // 笔记内容不能为空
    noteNotExist(id,name) // 同一账户下，笔记标题名不能相同（该笔记不能已经存在）
    public {
        // 将笔记内容存储到data变量中
        data[id][name] = content;
    }

    // 修改笔记（id：用户id；name：笔记标题名；content：笔记内容）
    function updateNote(string memory id,string memory name,string memory content)
    idNotNull(id)  // 使用modifier（函数修饰符）方式校检，用户id不能为空
    nameNotNull(name) // 笔记标题名不能为空
    contentNotNull(content) // 笔记内容不能为空
    noteIsExist(id,name) // 要修改的笔记必须首先存在
    public{
        // 修改笔记的内容
        data[id][name] = content;
    }

    // 根据用户id和笔记标题名获取云笔记内容。若不存在，则返回空字符串。
    function getNote(string memory id,string memory name) public view returns(string memory content){
        return data[id][name]; //返回相应的笔记内容
    }

    modifier idNotNull(string memory id){
        // 由于Solidity语言中string类型的值不能直接比较，所以使用keccak256函数将string类型的值
        // 转换为bytes32类型的值，再进行比较
        require(keccak256(abi.encodePacked(id))!= keccak256(""),"用户id不能为空！");
        _;
    }

    modifier nameNotNull(string memory name){
        require(keccak256(abi.encodePacked(name))!=keccak256(""),"笔记标题名不能为空！");
        _;
    }

    modifier contentNotNull(string memory content){
        require(keccak256(abi.encodePacked(content))!=keccak256(""),"笔记内容不能为空！");
        _;
    }

    modifier noteNotExist(string memory id,string memory name){
        require(keccak256(abi.encodePacked(data[id][name]))==keccak256(""),"该笔记已经存在！");
        _;
    }

    modifier noteIsExist(string memory id,string memory name){
        require(keccak256(abi.encodePacked(data[id][name]))!=keccak256(""),"该笔记不存在");
        _;
    }
}

