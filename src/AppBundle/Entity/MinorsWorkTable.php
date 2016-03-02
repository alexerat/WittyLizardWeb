<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * MinorsWorkTable
 *
 * @ORM\Table(name="Users.Minors_Work_Table", uniqueConstraints={@ORM\UniqueConstraint(name="Certificate_ID_UNIQUE", columns={"Certificate_ID"})}, indexes={@ORM\Index(name="fk_Minors_Work_Table_User_Table1_idx", columns={"User_Table_User_ID"}), @ORM\Index(name="fk_Minors_Work_Table_Confirmation_Staus1_idx", columns={"Status_ID"})})
 * @ORM\Entity
 */
class MinorsWorkTable
{
    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Document_Date", type="datetime", nullable=true)
     */
    private $documentDate;

    /**
     * @var integer
     *
     * @ORM\Column(name="Certificate_ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $certificateId;

    /**
     * @var \AppBundle\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\UserTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="User_Table_User_ID", referencedColumnName="User_ID")
     * })
     */
    private $userTableUser;

    /**
     * @var \AppBundle\Entity\ConfirmationStaus
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\ConfirmationStaus")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Status_ID", referencedColumnName="Status_ID")
     * })
     */
    private $status;



    /**
     * Set documentDate
     *
     * @param \DateTime $documentDate
     *
     * @return MinorsWorkTable
     */
    public function setDocumentDate($documentDate)
    {
        $this->documentDate = $documentDate;

        return $this;
    }

    /**
     * Get documentDate
     *
     * @return \DateTime
     */
    public function getDocumentDate()
    {
        return $this->documentDate;
    }

    /**
     * Get certificateId
     *
     * @return integer
     */
    public function getCertificateId()
    {
        return $this->certificateId;
    }

    /**
     * Set userTableUser
     *
     * @param \AppBundle\Entity\UserTable $userTableUser
     *
     * @return MinorsWorkTable
     */
    public function setUserTableUser(\AppBundle\Entity\UserTable $userTableUser = null)
    {
        $this->userTableUser = $userTableUser;

        return $this;
    }

    /**
     * Get userTableUser
     *
     * @return \AppBundle\Entity\UserTable
     */
    public function getUserTableUser()
    {
        return $this->userTableUser;
    }

    /**
     * Set status
     *
     * @param \AppBundle\Entity\ConfirmationStaus $status
     *
     * @return MinorsWorkTable
     */
    public function setStatus(\AppBundle\Entity\ConfirmationStaus $status = null)
    {
        $this->status = $status;

        return $this;
    }

    /**
     * Get status
     *
     * @return \AppBundle\Entity\ConfirmationStaus
     */
    public function getStatus()
    {
        return $this->status;
    }
}
