<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * QuestionsPrivilege
 *
 * @ORM\Table(name="Online_Comms.Question_Privilege",
 * indexes={@ORM\Index(name="fk_Question_Privilege_Global_Broadcast_Table1_idx", columns={"Broadcast_ID"}), @ORM\Index(name="fk_Question_Privilege_User_Table1_idx", columns={"User_ID"})})
 * @ORM\Entity
 */
class QuestionPrivilege
{

    /**
     * @var \App\Entity\GlobalBroadcastTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\GlobalBroadcastTable")
     * @ORM\Id
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Broadcast_ID", referencedColumnName="Broadcast_ID")
     * })
     */
    private $brodId;

    /**
     * @var \App\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\UserTable")
     * @ORM\Id
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="User_ID", referencedColumnName="User_ID")
     * })
     */
    private $user;

    /**
     * @var int
     *
     * @ORM\Column(name="Question_Count", type="integer")
    */
    private $qCount;

    /**
     * Set qCount
     *
     * @param integer $qCount
     *
     * @return QuestionPrivilege
     */
    public function setQCount($qCount)
    {
        $this->qCount = $qCount;

        return $this;
    }

    /**
     * Get qCount
     *
     * @return integer
     */
    public function getQCount()
    {
        return $this->qCount;
    }

    /**
     * Set brodId
     *
     * @param \App\Entity\GlobalBroadcastTable $brodId
     *
     * @return QuestionPrivilege
     */
    public function setBrodId(\App\Entity\GlobalBroadcastTable $brodId = null)
    {
        $this->brodId = $brodId;

        return $this;
    }

    /**
     * Get brodId
     *
     * @return \App\Entity\GlobalBroadcastTable
     */
    public function getBrodId()
    {
        return $this->brodId;
    }

    /**
     * Set user
     *
     * @param \App\Entity\UserTable $user
     *
     * @return QuestionPrivilege
     */
    public function setUser(\App\Entity\UserTable $user = null)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return \App\Entity\UserTable
     */
    public function getUser()
    {
        return $this->user;
    }
}
